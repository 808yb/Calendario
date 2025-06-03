import googleMeetLogo from "@/assets/google-meet.svg";
import meetInPersonLogo from "@/assets/meet-in-person.svg";

export enum VideoConferencingPlatform {
  GOOGLE_MEET_AND_CALENDAR = "GOOGLE_MEET_AND_CALENDAR",
  MEET_IN_PERSON = "MEET_IN_PERSON"
}

export const IntegrationLogos = {
  GOOGLE_MEET_AND_CALENDAR: googleMeetLogo,
  MEET_IN_PERSON: meetInPersonLogo,
};

export type IntegrationAppType =
  | "GOOGLE_MEET_AND_CALENDAR"
  | "MEET_IN_PERSON";

export type IntegrationAppLabel =
  | "Google Meet & Calendar"
  | "Meet in Person";

export const IntegrationDescriptions = {
  GOOGLE_MEET_AND_CALENDAR:
    "Google Meet & Calendar integration for video conferencing and scheduling.",
  MEET_IN_PERSON:
    "In-person meeting option for face-to-face events.",
};

export const IntegrationAppEnum = {
  GOOGLE_MEET_AND_CALENDAR: "GOOGLE_MEET_AND_CALENDAR",
  MEET_IN_PERSON: "MEET_IN_PERSON",
} as const;

export const locationOptions = [
  {
    label: "Google Meet",
    value: VideoConferencingPlatform.GOOGLE_MEET_AND_CALENDAR,
    logo: IntegrationLogos.GOOGLE_MEET_AND_CALENDAR,
    isAvailable: true,
  },
  {
    label: "Meet in Person",
    value: VideoConferencingPlatform.MEET_IN_PERSON,
    logo: IntegrationLogos.MEET_IN_PERSON,
    isAvailable: true,
  },
];
