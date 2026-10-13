import { openapi } from "@orpc/openapi";
import { base_contract } from "./errors";
import {
  add_testimonial_image_input,
  create_testimonial_input,
  delete_testimonial_image_input,
  delete_testimonial_input,
  get_testimonial_input,
  list_testimonies_input,
  testimonial_list_output,
  testimonial_output,
  update_testimonial_input,
} from "../schemas/testimonial.schema";

export const create_testimonial_contract = base_contract
  .meta(openapi({
    method: "POST",
    path: "/testimonials",
    tags: ["Testimonials"],
    successStatus: 201,
    summary: "Create testimonial",
    description: "Create a new testimonial.",
  }))
  .input(create_testimonial_input)
  .output(testimonial_output);

export const add_testimonial_image_contract = base_contract
  .meta(openapi({
    method: "POST",
    path: "/testimonials/{testimonialId}/images",
    tags: ["Testimonials"],
    successStatus: 201,
    summary: "Add testimonial image",
    description: "Add an image to a testimonial.",
  }))
  .input(add_testimonial_image_input)
  .output(testimonial_output);

export const update_testimonial_contract = base_contract
  .meta(openapi({
    method: "PUT",
    path: "/testimonials/{id}",
    tags: ["Testimonials"],
    successStatus: 200,
    summary: "Update testimonial",
    description: "Update a testimonial, requires authentication.",
  }))
  .input(update_testimonial_input)
  .output(testimonial_output);

export const delete_testimonial_contract = base_contract
  .meta(openapi({
    method: "DELETE",
    path: "/testimonials/{id}",
    tags: ["Testimonials"],
    successStatus: 200,
    summary: "Delete testimonial",
    description: "Delete a testimonial, requires authentication.",
  }))
  .input(delete_testimonial_input)
  .output(testimonial_output);

export const delete_testimonial_image_contract = base_contract
  .meta(openapi({
    method: "DELETE",
    path: "/testimonials/images/{id}",
    tags: ["Testimonials"],
    successStatus: 200,
    summary: "Delete testimonial image",
    description: "Delete a testimonial image, requires authentication.",
  }))
  .input(delete_testimonial_image_input)
  .output(testimonial_output);

export const get_testimonial_contract = base_contract
  .meta(openapi({
    method: "GET",
    path: "/testimonials/{id}",
    tags: ["Testimonials"],
    successStatus: 200,
    summary: "Get testimonial",
    description: "Get a testimonial by ID.",
  }))
  .input(get_testimonial_input)
  .output(testimonial_output);

export const list_testimonies_contract = base_contract
  .meta(openapi({
    method: "GET",
    path: "/testimonials",
    tags: ["Testimonials"],
    successStatus: 200,
    summary: "List testimonies",
    description: "List all testimonies.",
  }))
  .input(list_testimonies_input)
  .output(testimonial_list_output);
