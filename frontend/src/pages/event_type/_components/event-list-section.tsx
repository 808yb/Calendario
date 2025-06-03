import { EventType } from "@/types/api.type";
import EventCard from "./event-card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleEventVisibilityMutationFn, deleteEventMutationFn, updateEventMutationFn } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import type { CreateEventPayloadType } from "@/types/api.type";
import { locationOptions, VideoConferencingPlatform } from "@/lib/types";

const EventListSection = (props: { events: EventType[]; username: string }) => {
  const { events, username } = props;
  const [pendingEventId, setPendingEventId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<EventType | null>(null);
  const form = useForm({
    defaultValues: { title: "", description: "", duration: 30, locationType: VideoConferencingPlatform.MEET_IN_PERSON },
  });

  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: toggleEventVisibilityMutationFn,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEventMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event_list"] });
      toast.success("Event deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete event");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: CreateEventPayloadType }) => updateEventMutationFn(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event_list"] });
      toast.success("Event updated successfully");
      setIsEditOpen(false);
    },
    onError: () => {
      toast.error("Failed to update event");
    },
  });

  const toggleEventVisibility = (eventId: string) => {
    setPendingEventId(eventId);
    mutate(
      {
        eventId: eventId,
      },
      {
        onSuccess: (response) => {
          queryClient.invalidateQueries({
            queryKey: ["event_list"],
          });
          setPendingEventId(null);
          toast.success(`${response.message}`);
        },
        onError: () => {
          toast.success("Failed to switch event");
        },
      }
    );
  };

  const handleDelete = (eventId: string) => {
    deleteMutation.mutate(eventId);
  };

  const handleEdit = (event: EventType) => {
    form.reset({
      title: event.title,
      description: event.description || "",
      duration: event.duration,
      locationType: event.locationType || VideoConferencingPlatform.MEET_IN_PERSON,
    });
    setEditEvent(event);
    setIsEditOpen(true);
  };

  return (
    <div className="w-full">
      <div
        className="
        grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(min(calc(100%/3-24px),max(280px,calc(100%-48px)/3)),1fr))]
         gap-6 py-[10px] pb-[25px]
        "
      >
        {events?.map((event) => (
          <EventCard
            key={event.id}
            id={event.id}
            title={event.title}
            slug={event.slug}
            duration={event.duration}
            isPrivate={event.isPrivate}
            username={username}
            isPending={pendingEventId === event.id ? isPending : false}
            onToggle={() => toggleEventVisibility(event.id)}
            onEdit={() => handleEdit(event)}
            onDelete={() => handleDelete(event.id)}
          />
        ))}
      </div>
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit((data) => {
              if (!editEvent) return;
              updateMutation.mutate({ eventId: editEvent.id, data });
            })}
            className="space-y-4"
          >
            <Input {...form.register("title", { required: true })} placeholder="Event name" />
            <Textarea {...form.register("description")} placeholder="Description" />
            <Input type="number" {...form.register("duration", { valueAsNumber: true })} placeholder="Duration (minutes)" />
            <select {...form.register("locationType", { required: true })} className="w-full border rounded p-2">
              {locationOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <Button type="submit">Save</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventListSection;
