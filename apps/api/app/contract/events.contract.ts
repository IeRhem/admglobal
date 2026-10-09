import { openapi } from "@orpc/openapi";
import { base_contract } from "./errors";
import {
  add_flyer_input,
  add_minister_input,
  add_reservation_input,
  create_event_input,
  delete_event_input,
  delete_flyer_input,
  event_list_output,
  event_output,
  get_event_input,
  list_events_input,
  update_event_input,
  update_flyer_input,
  update_minister_input,
  update_reservation_input,
} from "../schemas/events.schema";

export const create_event_contract = base_contract
  .meta(openapi({
    method: "POST",
    path: "/events",
    tags: ["Events"],
    successStatus: 201,
    summary: "Create event",
    description: "Create a new event, requires authentication.",
  }))
  .input(create_event_input)
  .output(event_output);

export const update_event_contract = base_contract
  .meta(openapi({
    method: "PUT",
    path: "/events/{id}",
    tags: ["Events"],
    successStatus: 200,
    summary: "Update event",
    description: "Update an event, requires authentication.",
  }))
  .input(update_event_input)
  .output(event_output);

export const add_flyer_contract = base_contract
  .meta(openapi({
    method: "POST",
    path: "/events/{event_id}/flyers",
    tags: ["Events"],
    successStatus: 201,
    summary: "Add flyer",
    description: "Add a flyer to an event, requires authentication.",
  }))
  .input(add_flyer_input)
  .output(event_output);

export const update_flyer_contract = base_contract
  .meta(openapi({
    method: "PUT",
    path: "/events/flyers/{id}",
    tags: ["Events"],
    successStatus: 200,
    summary: "Update flyer",
    description: "Update a flyer, requires authentication.",
  }))
  .input(update_flyer_input)
  .output(event_output);

export const add_minister_contract = base_contract
  .meta(openapi({
    method: "POST",
    path: "/events/{event_id}/ministers",
    tags: ["Events"],
    successStatus: 201,
    summary: "Add minister",
    description: "Add a minister to an event, requires authentication.",
  }))
  .input(add_minister_input)
  .output(event_output);

export const update_minister_contract = base_contract
  .meta(openapi({
    method: "PUT",
    path: "/events/ministers/{id}",
    tags: ["Events"],
    successStatus: 200,
    summary: "Update minister",
    description: "Update a minister, requires authentication.",
  }))
  .input(update_minister_input)
  .output(event_output);

export const create_reservation_contract = base_contract
  .meta(openapi({
    method: "POST",
    path: "/events/{event_id}/reservations",
    tags: ["Events"],
    successStatus: 201,
    summary: "Create reservation",
    description: "Create a reservation for an event.",
  }))
  .input(add_reservation_input)
  .output(event_output);

export const update_reservation_contract = base_contract
  .meta(openapi({
    method: "PUT",
    path: "/events/reservations/{id}",
    tags: ["Events"],
    successStatus: 200,
    summary: "Update reservation",
    description: "Update a reservation, requires authentication.",
  }))
  .input(update_reservation_input)
  .output(event_output);

export const delete_event_contract = base_contract
  .meta(openapi({
    method: "DELETE",
    path: "/events/{id}",
    tags: ["Events"],
    successStatus: 200,
    summary: "Delete event",
    description: "Delete an event, requires authentication.",
  }))
  .input(delete_event_input)
  .output(event_output);

export const delete_flyer_contract = base_contract
  .meta(openapi({
    method: "DELETE",
    path: "/events/flyers/{id}",
    tags: ["Events"],
    successStatus: 200,
    summary: "Delete flyer",
    description: "Delete a flyer, requires authentication.",
  }))
  .input(delete_flyer_input)
  .output(event_output);

export const get_event_contract = base_contract
  .meta(openapi({
    method: "GET",
    path: "/events/{id}",
    tags: ["Events"],
    successStatus: 200,
    summary: "Get event",
    description: "Get an event by ID.",
  }))
  .input(get_event_input)
  .output(event_output);

export const list_events_contract = base_contract
  .meta(openapi({
    method: "GET",
    path: "/events",
    tags: ["Events"],
    successStatus: 200,
    summary: "List events",
    description: "List all events.",
  }))
  .input(list_events_input)
  .output(event_list_output);
