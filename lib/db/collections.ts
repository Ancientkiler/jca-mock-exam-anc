import type { Collection } from "mongodb";
import { getDb } from "@/lib/db/client";
import type {
  AnswerDoc,
  AttemptDoc,
  LoginAttemptDoc,
  PaperDoc,
  QuestionDoc,
  TestDoc,
  UserDoc,
} from "@/lib/db/types";

export async function users(): Promise<Collection<UserDoc>> {
  return (await getDb()).collection<UserDoc>("users");
}

export async function papers(): Promise<Collection<PaperDoc>> {
  return (await getDb()).collection<PaperDoc>("papers");
}

export async function questions(): Promise<Collection<QuestionDoc>> {
  return (await getDb()).collection<QuestionDoc>("questions");
}

export async function tests(): Promise<Collection<TestDoc>> {
  return (await getDb()).collection<TestDoc>("tests");
}

export async function attempts(): Promise<Collection<AttemptDoc>> {
  return (await getDb()).collection<AttemptDoc>("attempts");
}

export async function answers(): Promise<Collection<AnswerDoc>> {
  return (await getDb()).collection<AnswerDoc>("answers");
}

export async function loginAttempts(): Promise<Collection<LoginAttemptDoc>> {
  return (await getDb()).collection<LoginAttemptDoc>("login_attempts");
}
