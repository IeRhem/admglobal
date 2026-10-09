export function parseVideoDurationInSeconds(duration: string): number {
  const parts = duration.split(":").map(Number);

  if (parts.some((part) => Number.isNaN(part)) || parts.length < 2) {
    return 0;
  }

  return parts.length === 3
    ? parts[0] * 3600 + parts[1] * 60 + parts[2]
    : parts[0] * 60 + parts[1];
}

export function isLongFormDuration(duration: string): boolean {
  return parseVideoDurationInSeconds(duration) > 180;
}
