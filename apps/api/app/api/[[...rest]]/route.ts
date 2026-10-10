import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferenceHandlerPlugin } from "@orpc/openapi/plugins";
import { SmartCoercionHandlerPlugin } from "@orpc/json-schema";
import { ZodToJsonSchemaConverter } from "@orpc/zod";
import { CORSPlugin } from "@orpc/server/plugins";
import { onError } from "@orpc/server";
import { router } from "@/app/router";
import { OpenAPIGenerator } from "@orpc/openapi";

const schemaConverters = [new ZodToJsonSchemaConverter()];

const generator = new OpenAPIGenerator({
  converters: [
    new ZodToJsonSchemaConverter(),
  ],
})

const handler = new OpenAPIHandler(router, {
  plugins: [
    new CORSPlugin(),
      new SmartCoercionHandlerPlugin({ converters: schemaConverters }),
    new OpenAPIReferenceHandlerPlugin({
      spec: () => generator.generate(router, {
        base: {
          info: {
            title: 'ORPC Playground',
            version: '1.0.0',
          },
          servers: [
            { url: `${process.env.ADMI_API_URL}`, },
          ],
          security: [{ bearerAuth: [] }],
          components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
            },
          },
        },
        },
      }),
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

async function handleRequest(request: Request) {
  const { response } = await handler.handle(request, {
    prefix: "/api",
    context: { headers: request.headers },
  });

  return response ?? new Response("Not found", { status: 404 });
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
export const OPTIONS = handleRequest;