import tutOpenApi from '@tut/openapi';

const handler = (request: Request) => tutOpenApi.fetch(request);

// Export all required HTTP method handlers
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
export const OPTIONS = handler;
export const HEAD = handler;
