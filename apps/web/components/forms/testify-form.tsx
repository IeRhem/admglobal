"use client";

import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@repo/ui/components/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@repo/ui/components/attachment";
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import { testifyFormSchema, type TestifyFormValues } from "@/lib/schemas/testify";
import { toast } from "@repo/ui/components/toast";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGE_COUNT = 5;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function TestifyForm() {
  const [images, setImages] = useState<File[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const form = useForm<TestifyFormValues>({
    resolver: zodResolver(testifyFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      testimony: "",
    },
  });

  async function onSubmit(data: TestifyFormValues) {
    let testimonyCreated = false;
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        message: data.testimony,
      };
      
      const response = await fetch(`${process.env.ADMI_API_URL}/testimonials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Testimony form submission failed (${response.status})`);
      }

      testimonyCreated = true;
      const created: unknown = await response.json();
      const testimonialId =
        typeof created === "object" &&
        created !== null &&
        "id" in created &&
        (typeof created.id === "string" || typeof created.id === "number")
          ? String(created.id)
          : null;
      if (testimonialId === null) {
        throw new Error("The API did not return the new testimony ID.");
      }

      for (const [index, image] of images.entries()) {
        setUploadingIndex(index);
        const upload = new FormData();
        upload.set("file", image);
        upload.set("testimonialId", String(testimonialId));
        const imageResponse = await fetch(`${process.env.ADMI_API_URL}/s3/upload`, {
          method: "POST",
          body: upload,
        });
        if (!imageResponse.ok) {
          throw new Error(`Image upload failed (${imageResponse.status}).`);
        }
      }

      toast.add({
        type: "success",
        description: "Your testimony has been submitted successfully.",
      });
    } catch (error) {
      console.error("Unable to submit testimony:", error);
      toast.add({
        type: "error",
        description:
          testimonyCreated
            ? "Your written testimony was submitted, but one or more images could not be uploaded. Please contact us to add them."
            : error instanceof Error
            ? `Testimony submission stopped: ${error.message}`
            : "We could not submit your testimony. Please try again.",
      });
    } finally {
      if (testimonyCreated) {
        form.reset({
          firstName: "",
          lastName: "",
          email: "",
          testimony: "",
        });
        setImages([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
      setUploadingIndex(null);
    }
  }

  function addImages(files: FileList | null) {
    if (!files) return;
    const selected = Array.from(files);
    const invalidType = selected.find(
      (file) => !ACCEPTED_IMAGE_TYPES.includes(file.type),
    );
    if (invalidType) {
      toast.add({
        type: "error",
        description: "Choose JPEG, PNG, or WebP images.",
      });
      return;
    }
    const tooLarge = selected.find((file) => file.size > MAX_IMAGE_SIZE);
    if (tooLarge) {
      toast.add({
        type: "error",
        description: "Each image must be no larger than 5 MB.",
      });
      return;
    }
    if (images.length + selected.length > MAX_IMAGE_COUNT) {
      toast.add({
        type: "error",
        description: `You can attach up to ${MAX_IMAGE_COUNT} images.`,
      });
      return;
    }
    setImages((current) => [...current, ...selected]);
  }

  const formId = "testify-form";

  return (
    <Card className="w-full sm:max-w-2xl mx-auto">
      <CardContent>
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* First Name & Last Name row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                name="firstName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${formId}-firstName`}>
                      First Name
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`${formId}-firstName`}
                      aria-invalid={fieldState.invalid}
                      placeholder="John"
                      autoComplete="given-name"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="lastName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${formId}-lastName`}>
                      Second Name / Last Name
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`${formId}-lastName`}
                      aria-invalid={fieldState.invalid}
                      placeholder="Doe"
                      autoComplete="family-name"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            {/* Email */}
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${formId}-email`}>Email</FieldLabel>
                  <Input
                    {...field}
                    id={`${formId}-email`}
                    type="email"
                    aria-invalid={fieldState.invalid}
                    placeholder="john@example.com"
                    autoComplete="email"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Field>
              <FieldLabel htmlFor={`${formId}-images`}>
                Images (optional)
              </FieldLabel>
              <input
                ref={fileInputRef}
                id={`${formId}-images`}
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={form.formState.isSubmitting}
                onChange={(event) => {
                  addImages(event.currentTarget.files);
                  event.currentTarget.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={form.formState.isSubmitting}
              >
                <IconUpload className="size-4" />
                Choose images
              </Button>
              <p className="text-sm text-muted-foreground">
                JPEG, PNG, or WebP; up to 5 MB each, {MAX_IMAGE_COUNT} images maximum.
              </p>
              {images.length > 0 && (
                <AttachmentGroup className="flex-col">
                  {images.map((image, index) => (
                    <Attachment
                      key={`${image.name}-${image.lastModified}-${index}`}
                      state={uploadingIndex === index ? "uploading" : "idle"}
                      className="w-full"
                    >
                      <AttachmentMedia>
                        <IconPhoto aria-hidden="true" />
                      </AttachmentMedia>
                      <AttachmentContent>
                        <AttachmentTitle>{image.name}</AttachmentTitle>
                        <AttachmentDescription>
                          {uploadingIndex === index
                            ? "Uploading..."
                            : `${(image.size / 1024 / 1024).toFixed(2)} MB`}
                        </AttachmentDescription>
                      </AttachmentContent>
                      <AttachmentActions>
                        <AttachmentAction
                          type="button"
                          aria-label={`Remove ${image.name}`}
                          disabled={form.formState.isSubmitting}
                          onClick={() =>
                            setImages((current) =>
                              current.filter((_, itemIndex) => itemIndex !== index),
                            )
                          }
                        >
                          <IconX />
                        </AttachmentAction>
                      </AttachmentActions>
                    </Attachment>
                  ))}
                </AttachmentGroup>
              )}
            </Field>

            {/* Testimony */}
            <Controller
              name="testimony"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${formId}-testimony`}>
                    Testimony
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={`${formId}-testimony`}
                    aria-invalid={fieldState.invalid}
                    placeholder="Share what God has done..."
                    className="min-h-37.5"
                    aria-expanded
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          form={formId}
          size="lg"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Submitting..." : "Submit Testimony"}
        </Button>
      </CardFooter>
    </Card>
  );
}
