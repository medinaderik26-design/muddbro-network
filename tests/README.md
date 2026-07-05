# Muddbro Network — Test Suite

This directory contains tests for the Muddbro Network backend functions.

## Running Tests

```bash
# Run all tests
deno task test

# Run a specific test file
deno test --allow-net --allow-env tests/config_test.ts
```

## Test Files

- `config_test.ts` — Tests for the centralized config module (validation helpers, rate limiter)
