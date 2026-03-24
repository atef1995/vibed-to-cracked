import { prisma } from "@/lib/prisma";

const VALID_MOODS = ["CHILL", "RUSH", "GRIND"];
const VALID_DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];
const REMINDER_TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export interface SettingsInput {
  name: string;
  preferredMood?: string;
  notifications?: {
    email?: boolean;
    reminders?: boolean;
    achievements?: boolean;
    weeklyProgress?: boolean;
  };
  privacy?: {
    showProfile?: boolean;
    shareProgress?: boolean;
    allowAnalytics?: boolean;
  };
  learning?: {
    dailyGoal?: number;
    reminderTime?: string;
    timezone?: string;
    difficulty?: string;
    autoSubmit?: boolean;
  };
}

export type ValidationError = { field: string; message: string };

export function validateSettingsInput(
  input: SettingsInput
): ValidationError | null {
  const { name, preferredMood, learning } = input;

  if (!name || typeof name !== "string") {
    return { field: "name", message: "Name is required" };
  }
  if (name.trim().length > 255) {
    return { field: "name", message: "Name must be 255 characters or fewer" };
  }

  const normalizedMood = preferredMood?.toUpperCase();
  if (normalizedMood && !VALID_MOODS.includes(normalizedMood)) {
    return { field: "preferredMood", message: "Invalid mood" };
  }

  const dailyGoal = learning?.dailyGoal;
  if (
    dailyGoal != null &&
    (typeof dailyGoal !== "number" || dailyGoal < 5 || dailyGoal > 480)
  ) {
    return {
      field: "dailyGoal",
      message: "Daily goal must be between 5 and 480 minutes",
    };
  }

  const normalizedDifficulty = learning?.difficulty?.toUpperCase();
  if (
    normalizedDifficulty &&
    !VALID_DIFFICULTIES.includes(normalizedDifficulty)
  ) {
    return { field: "difficulty", message: "Invalid difficulty" };
  }

  const reminderTime = learning?.reminderTime;
  if (reminderTime && !REMINDER_TIME_RE.test(reminderTime)) {
    return {
      field: "reminderTime",
      message: "Reminder time must be in HH:MM format",
    };
  }

  const timezone = learning?.timezone;
  if (timezone && (typeof timezone !== "string" || timezone.length > 100)) {
    return { field: "timezone", message: "Invalid timezone" };
  }

  return null;
}

export async function getUserSettings(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      mood: true,
      userSettings: true,
    },
  });

  if (!user) return null;

  const s = user.userSettings;
  return {
    name: user.name,
    email: user.email,
    preferredMood: user.mood.toLowerCase(),
    notifications: {
      email: s?.emailNotifications ?? true,
      reminders: s?.reminderNotifications ?? true,
      achievements: s?.achievementNotifications ?? true,
      weeklyProgress: s?.weeklyProgressReports ?? false,
    },
    privacy: {
      showProfile: s?.showPublicProfile ?? true,
      shareProgress: s?.shareProgress ?? true,
      allowAnalytics: s?.allowAnalytics ?? true,
    },
    learning: {
      dailyGoal: s?.dailyGoalMinutes ?? 30,
      reminderTime: s?.reminderTime ?? "18:00",
      timezone: s?.timezone ?? "UTC",
      difficulty: s?.difficulty?.toLowerCase() ?? "medium",
      autoSubmit: s?.autoSubmit ?? false,
    },
  };
}

export async function updateUserSettings(userId: string, input: SettingsInput) {
  const { name, preferredMood, notifications, privacy, learning } = input;

  const normalizedMood = preferredMood?.toUpperCase();
  const normalizedDifficulty = learning?.difficulty?.toUpperCase();

  const settingsData = {
    emailNotifications: notifications?.email === true,
    reminderNotifications: notifications?.reminders === true,
    achievementNotifications: notifications?.achievements === true,
    weeklyProgressReports: notifications?.weeklyProgress === true,
    showPublicProfile: privacy?.showProfile !== false,
    shareProgress: privacy?.shareProgress !== false,
    allowAnalytics: privacy?.allowAnalytics !== false,
    dailyGoalMinutes: learning?.dailyGoal ?? 30,
    reminderTime: learning?.reminderTime ?? "18:00",
    timezone: learning?.timezone ?? "UTC",
    difficulty: normalizedDifficulty ?? "MEDIUM",
    autoSubmit: learning?.autoSubmit === true,
  };

  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        mood: normalizedMood || "CHILL",
      },
      select: { name: true, email: true },
    }),
    prisma.userSettings.upsert({
      where: { userId },
      update: settingsData,
      create: { userId, ...settingsData },
    }),
  ]);

  return updatedUser;
}
