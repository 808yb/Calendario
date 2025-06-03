import { AvailabilityResponseType } from "../@types/availability.type";
import { AppDataSource } from "../config/database.config";
import { User } from "../database/entities/user.entity";
import { NotFoundException } from "../utils/app-error";
import { UpdateAvailabilityDto } from "../database/dto/availability.dto";
import { Availability } from "../database/entities/availability.entity";
import { DayOfWeekEnum } from "../database/entities/day-availability";
import { Event } from "../database/entities/event.entity";
import { addDays, addMinutes, format, parseISO } from "date-fns";

export const getUserAvailabilityService = async (userId: string) => {
  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository.findOne({
    where: { id: userId },
    relations: ["availability", "availability.days"],
  });
  if (!user || !user.availability) {
    throw new NotFoundException("User not found or availbility");
  }

  const availabilityData: AvailabilityResponseType = {
    timeGap: user.availability.timeGap,
    days: [],
  };

  // If no days exist, return a default week (all days, unavailable, 09:00-17:00)
  if (!user.availability.days || user.availability.days.length === 0) {
    const defaultDays = [
      "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"
    ];
    defaultDays.forEach((day) => {
      availabilityData.days.push({
        day,
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: false,
      });
    });
  } else {
    user.availability.days.forEach((dayAvailability) => {
      availabilityData.days.push({
        day: dayAvailability.day,
        startTime: dayAvailability.startTime.toISOString().slice(11, 16),
        endTime: dayAvailability.endTime.toISOString().slice(11, 16),
        isAvailable: dayAvailability.isAvailable,
      });
    });
  }

  return availabilityData;
};

export const updateAvailabilityService = async (
  userId: string,
  data: UpdateAvailabilityDto
) => {
  const userRepository = AppDataSource.getRepository(User);
  const availabilityRepository = AppDataSource.getRepository(Availability);
  const dayAvailabilityRepository = AppDataSource.getRepository(require('../database/entities/day-availability').DayAvailability);

  const user = await userRepository.findOne({
    where: { id: userId },
    relations: ["availability", "availability.days"],
  });

  if (!user) throw new NotFoundException("User not found");

  // Delete all existing DayAvailability rows for this user's availability
  if (user.availability && user.availability.id) {
    await dayAvailabilityRepository.delete({ availability: { id: user.availability.id } });
  }

  const baseDate = new Date().toISOString().split("T")[0];
  const dayAvailabilityData = data.days.map(({ day, isAvailable, startTime, endTime }) => ({
    day: day.toUpperCase() as DayOfWeekEnum,
    startTime: new Date(`${baseDate}T${startTime}:00Z`),
    endTime: new Date(`${baseDate}T${endTime}:00Z`),
    isAvailable,
    availability: { id: user.availability.id },
  }));

  if (user.availability) {
    // Save the new days
    await dayAvailabilityRepository.save(dayAvailabilityData);
    // Update the timeGap
    await availabilityRepository.save({
      id: user.availability.id,
      timeGap: data.timeGap,
    });
  }

  return { sucess: true };
};

export const getAvailabilityForPublicEventService = async (eventId: string) => {
  const eventRepository = AppDataSource.getRepository(Event);

  const event = await eventRepository.findOne({
    where: { id: eventId, isPrivate: false },
    relations: [
      "user",
      "user.availability",
      "user.availability.days",
      "user.meetings",
    ],
  });

  if (!event || !event.user.availability) return [];

  const { availability, meetings } = event.user;
  const daysOfWeek = Object.values(DayOfWeekEnum);
  const availableDays = [];

  for (const dayOfWeek of daysOfWeek) {
    const dayAvailability = availability.days.find((d) => d.day === dayOfWeek);
    const nextDates = getNextDateForDay(dayOfWeek, dayAvailability, event, meetings, availability.timeGap);
    if (dayAvailability) {
      let allSlots: string[] = [];
      for (const nextDate of nextDates) {
        const slots = dayAvailability.isAvailable
          ? generateAvailableTimeSlots(
              dayAvailability.startTime,
              dayAvailability.endTime,
              event.duration,
              meetings,
              format(nextDate, "yyyy-MM-dd"),
              availability.timeGap
            )
          : [];
        if (slots.length > 0) {
          allSlots = slots;
          break;
        }
      }
      const dateSlotsArr = [];
      for (const nextDate of nextDates) {
        const slots = dayAvailability.isAvailable
          ? generateAvailableTimeSlots(
              dayAvailability.startTime,
              dayAvailability.endTime,
              event.duration,
              meetings,
              format(nextDate, "yyyy-MM-dd"),
              availability.timeGap
            )
          : [];
        if (slots.length > 0) {
          dateSlotsArr.push({
            dateStr: format(nextDate, "yyyy-MM-dd"),
            slots,
          });
        }
      }
      availableDays.push({
        day: dayOfWeek,
        dates: dateSlotsArr,
        isAvailable: dayAvailability.isAvailable,
      });
    }
  }
  return availableDays;
};

function getNextDateForDay(dayOfWeek: string, dayAvailability?: any, event?: any, meetings?: any, timeGap?: number): Date[] {
  const days = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];

  const today = new Date();
  const todayDay = today.getDay();
  const targetDay = days.indexOf(dayOfWeek);
  const dates: Date[] = [];

  let weekOffset = 0;
  let count = 0;
  while (count < 4) {
    let daysUntilTarget = (targetDay - todayDay + 7) % 7 + 7 * weekOffset;
    let nextDate = addDays(today, daysUntilTarget);
    if (weekOffset === 0 && daysUntilTarget === 0) {
      if (
        dayAvailability && event && meetings && typeof timeGap !== 'undefined'
      ) {
        const slots = generateAvailableTimeSlots(
          dayAvailability.startTime,
          dayAvailability.endTime,
          event.duration,
          meetings,
          format(nextDate, "yyyy-MM-dd"),
          timeGap,
          true
        );
        if (slots.length === 0) {
          weekOffset++;
          continue;
        }
      }
    }
    dates.push(nextDate);
    weekOffset++;
    count++;
  }
  return dates;
}

function generateAvailableTimeSlots(
  startTime: Date,
  endTime: Date,
  duration: number,
  meetings: { startTime: Date; endTime: Date }[],
  dateStr: string,
  timeGap: number = 30,
  isTodayCheck: boolean = false
) {
  const slots = [];

  // Use the actual startTime and endTime from DayAvailability, but set the date to dateStr
  let slotStartTime = new Date(`${dateStr}T${startTime.toISOString().slice(11, 19)}`);
  let slotEndTime = new Date(`${dateStr}T${endTime.toISOString().slice(11, 19)}`);

  const now = new Date();
  const isToday = format(now, "yyyy-MM-dd") === dateStr;

  // If today and now is after 16:30, return no slots
  if (isToday && now > slotEndTime) {
    return [];
  }

  // Only consider meetings that are on the same date as dateStr
  const meetingsForDate = meetings.filter(meeting =>
    format(meeting.startTime, "yyyy-MM-dd") === dateStr
  );

  while (slotStartTime <= slotEndTime) {
    if (!isToday || slotStartTime >= now) {
      const slotEnd = new Date(slotStartTime.getTime() + duration * 60000);
      if (isSlotAvailable(slotStartTime, slotEnd, meetingsForDate)) {
        slots.push(format(slotStartTime, "HH:mm"));
      }
    }
    slotStartTime = addMinutes(slotStartTime, timeGap);
  }

  return slots;
}

function isSlotAvailable(
  slotStart: Date,
  slotEnd: Date,
  meetings: { startTime: Date; endTime: Date }[]
): boolean {
  for (const meeting of meetings) {
    if (slotStart < meeting.endTime && slotEnd > meeting.startTime) {
      return false;
    }
  }
  return true;
}
