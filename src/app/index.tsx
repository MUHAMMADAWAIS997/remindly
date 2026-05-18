import { Redirect } from 'expo-router';
import React from 'react';

export default function Index() {
  // Bypass the default page and send unauthenticated users to login
  return <Redirect href="/login" />;
}
