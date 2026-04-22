"use client";

import { useEffect, useState } from "react";
import { useNavigation } from "react-router";
import { Progress } from "~/components/ui/progress";

export function RouteProgress() {
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (navigation.state === "idle") {
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
    } else {
      setVisible(true);
      let value = 10;
      const interval = setInterval(() => {
        value = Math.min(value + Math.random() * 15, 90);
        setProgress(value);
      }, 150);
      return () => clearInterval(interval);
    }
  }, [navigation.state]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-51">
      <Progress value={progress} className="h-[3px] bg-transparent" />
    </div>
  );
}