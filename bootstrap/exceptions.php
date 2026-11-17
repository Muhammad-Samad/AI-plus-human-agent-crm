<?php

use App\Exceptions\ConflictException;
use App\Exceptions\ConversationClosedException;
use App\Exceptions\NotFoundException;
use App\Helpers\ApiResponse;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return function ($exceptions) {

    $exceptions->render(function (NotFoundException $e, Request $request) {
        return ApiResponse::error($e->getMessage(), 404);
    });

    $exceptions->render(function (ConversationClosedException $e, Request $request) {
        return ApiResponse::error($e->getMessage(), 422);
    });

    $exceptions->render(function (ConflictException $e, Request $request) {
        return ApiResponse::error($e->getMessage(), 409);
    });

    $exceptions->render(function (ValidationException $e, Request $request) {
        $firstError = collect($e->errors())->flatten()->first();

        return ApiResponse::error(
            $firstError ?: 'The given data was invalid.',
            $e->status,
            $e->errors()
        );
    });

    $exceptions->render(function (AuthenticationException $e, Request $request) {
        return ApiResponse::error(
            $e->getMessage() ?: 'Unauthenticated.',
            401
        );
    });

    $exceptions->render(function (ThrottleRequestsException $e, Request $request) {
        $retryAfter = $e->getHeaders()['Retry-After'] ?? null;
        $message    = $retryAfter
            ? "Too many attempts. Please try again in {$retryAfter} seconds."
            : 'Too many attempts. Please try again later.';

        return ApiResponse::error($message, 429);
    });

    $exceptions->render(function (InvalidArgumentException $e, Request $request) {
        return ApiResponse::error($e->getMessage(), 400);
    });

    /*
    |--------------------------------------------------------------------------
    | Fallback Exception Handler
    |--------------------------------------------------------------------------
    |
    | This must remain the LAST exception renderer. It acts as a catch-all
    | for any unhandled exceptions in the application. Any handlers placed
    | after this will never be reached.
    |
    */
    $exceptions->render(function (Throwable $e, Request $request) {
        // Web pages (agent dashboard, chat demo) use Laravel's default error
        // pages - otherwise a 404 or a missing Vite manifest shows up as a
        // bare JSON "Internal Server Error".
        if (! $request->is('api/*') && ! $request->expectsJson()) {
            return null;
        }

        // Keep the real status for HTTP exceptions (404 route not found, 405, ...)
        if ($e instanceof HttpExceptionInterface) {
            return ApiResponse::error($e->getMessage() ?: 'Request failed', $e->getStatusCode());
        }

        Log::error($e->getMessage(), ['exception' => $e]);

        return ApiResponse::error('Internal Server Error', 500);
    });
};
