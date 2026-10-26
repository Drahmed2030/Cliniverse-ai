// Public Supabase project coordinates (the anon key is public by design; access is governed by RLS).
// Kept in a module that creates NO client so isolated flows (password recovery) can use them without
// instantiating the shared client, which would read auth tokens from the page URL.
export const supabaseUrl = 'https://zbiujqxinvcxvuviuenx.supabase.co'
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaXVqcXhpbnZjeHZ1dml1ZW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxOTEzOTYsImV4cCI6MjA5OTc2NzM5Nn0.7znHWJXnYNgQmTVyzouuxQDFXxDEvVk9F2I75ArA8d8'
