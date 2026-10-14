import { openapi } from "@orpc/openapi";
import { base_contract } from "./errors";
import {
  contact_list_output,
  contact_output,
  create_contact_input,
  delete_contact_input,
  list_contacts_input,
  update_contact_input,
} from "../schemas/contact.schema";

export const create_contact_contract = base_contract
  .meta(
    openapi({
      method: "POST",
      path: "/contacts",
      tags: ["Contacts"],
      successStatus: 201,
      summary: "Contact us",
      description: "Contact us for prayer, counceling or inquiry.",
    }),
  )
  .input(create_contact_input)
  .output(contact_output);

export const update_contact_contract = base_contract
  .meta(
    openapi({
      method: "PUT",
      path: "/contacts/{id}",
      tags: ["Contacts"],
      successStatus: 200,
      summary: "Update contact request",
      description: "Update a contact request, requires authentication.",
    }),
  )
  .input(update_contact_input)
  .output(contact_output);

export const delete_contact_contract = base_contract
  .meta(
    openapi({
      method: "DELETE",
      path: "/contacts/{id}",
      tags: ["Contacts"],
      successStatus: 200,
      summary: "Delete contact request",
      description: "Delete a contact request, requires authentication.",
    }),
  )
  .input(delete_contact_input)
  .output(contact_output);

export const list_contacts_contract = base_contract
  .meta(
    openapi({
      method: "GET",
      path: "/contacts",
      tags: ["Contacts"],
      successStatus: 200,
      summary: "List contacts request",
      description: "List all contacts request, requires authentication.",
    }),
  )
  .input(list_contacts_input)
  .output(contact_list_output);
