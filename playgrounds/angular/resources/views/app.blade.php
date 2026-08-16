<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <link rel="stylesheet" href="/build/angular/styles.css" />
    <script type="module" src="/build/angular/main.js"></script>
    @inertiaHead
  </head>
  <body>@inertia</body>
</html>
