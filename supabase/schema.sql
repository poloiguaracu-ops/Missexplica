-- MissExplica • banco de dados do AVA
-- Execute este arquivo no SQL Editor do seu projeto Supabase.

create extension if not exists pgcrypto;

create type public.user_role as enum ('student','teacher','manager');
create type public.lesson_status as enum ('draft','published');

after alter? 
