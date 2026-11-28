"use client";

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type Auth,
  type ConfirmationResult,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCUaJQpWQ6MEM1VqvhhevrOpUFs6zm4Rxs",
  authDomain: "yaga-hot-deals.firebaseapp.com",
  databaseURL: "https://yaga-hot-deals-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "yaga-hot-deals",
  appId: "1:254497809499:web:25ef75b4432b6d02994b7e",
};

let app: FirebaseApp | undefined;

export function getFirebaseAuth(): Auth {
  if (!app) app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return getAuth(app);
}

let verifier: RecaptchaVerifier | null = null;

export function getRecaptcha(containerId: string): RecaptchaVerifier {
  if (verifier) return verifier;
  const auth = getFirebaseAuth();
  verifier = new RecaptchaVerifier(auth, containerId, { size: "invisible" });
  return verifier;
}

export async function sendPhoneOtp(phone: string): Promise<ConfirmationResult> {
  const auth = getFirebaseAuth();
  const recaptcha = getRecaptcha("ws-recaptcha");
  const result = await signInWithPhoneNumber(auth, phone, recaptcha);
  return result;
}

export async function confirmPhoneOtp(
  confirmation: ConfirmationResult,
  code: string
) {
  const auth = getFirebaseAuth();
  return confirmation.confirm(code);
}