import { toNextJsHandler } from 'better-auth/next-js';
import type { NextRequest } from 'next/server';

import { auth } from '@/auth';

const jsonContentTypeRegex = /^application\/(?:[a-z0-9.+-]*\+)?json/i;

const handler = toNextJsHandler(auth);

const malformedJsonResponse = () =>
  Response.json({ code: 'INVALID_JSON', message: 'Malformed JSON request body' }, { status: 400 });

/**
 * better-call currently treats Request.json() SyntaxError as a server error.
 * Validate JSON bodies at the route boundary so malformed client payloads stay 400s.
 */
const validateJsonBody = async (request: Request) => {
  const contentType = request.headers.get('content-type') || '';
  if (!request.body || !jsonContentTypeRegex.test(contentType)) return;

  try {
    await request.clone().json();
  } catch (error) {
    if (error instanceof SyntaxError) return malformedJsonResponse();
    throw error;
  }
};

export const GET = handler.GET;

export const POST = async (request: NextRequest) => {
  // MCIT Security Rule: Disable public self-registration.
  // Only internal requests authorized with 'x-mcit-admin-internal' can sign up users.
  if (
    request.nextUrl.pathname.includes('/sign-up/email') &&
    !request.headers.get('x-mcit-admin-internal')
  ) {
    return Response.json(
      {
        code: 'PUBLIC_SIGNUP_DISABLED',
        message: 'Public registration is disabled. Accounts can only be provisioned by the MCIT Administrator.',
      },
      { status: 403 },
    );
  }

  const invalidJsonResponse = await validateJsonBody(request);
  if (invalidJsonResponse) return invalidJsonResponse;

  return handler.POST(request);
};
