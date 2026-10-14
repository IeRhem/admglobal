import { implement } from "@orpc/server";
import { contract } from "../contract";
import { BaseContext } from "./midddleware";
import {
  add_testimonial_image,
  create_testimonial,
  delete_testimonial,
  delete_testimonial_image,
  get_testimonial,
  list_testimonies,
  update_testimonial,
} from "./testimonial";
import {
  add_flyer,
  add_minister,
  create_event,
  create_reservation,
  delete_event,
  delete_flyer,
  get_event,
  list_events,
  update_event,
  update_flyer,
  update_minister,
  update_reservation,
} from "./event";
import {
  create_contact,
  delete_contact,
  list_contacts,
  update_contact,
} from "./contact";

const os = implement(contract).$context<BaseContext>();

export const router = os.router({
  testimonial: {
    create: create_testimonial,
    add_image: add_testimonial_image,
    update: update_testimonial,
    delete: delete_testimonial,
    delete_image: delete_testimonial_image,
    get: get_testimonial,
    list: list_testimonies,
  },
  event: {
    create: create_event,
    list: list_events,
    update: update_event,
    add_flyer: add_flyer,
    update_flyer: update_flyer,
    add_minister: add_minister,
    update_minister: update_minister,
    create_reservation: create_reservation,
    update_reservation: update_reservation,
    delete: delete_event,
    delete_flyer: delete_flyer,
    get: get_event,
  },
  contact: {
    create: create_contact,
    update: update_contact,
    delete: delete_contact,
    list: list_contacts,
  },
});
