import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface InfoTooltipProps {
  text: string;
  className?: string;
}

/**
 * Small discreet "?" icon that displays a contextual tooltip on hover/focus.
 * Designed to be embedded next to a Label without breaking the label click
 * behavior on the associated input. Uses a span trigger to avoid form
 * submission or label-target focus stealing.
 */
export const InfoTooltip = ({ text, className }: InfoTooltipProps) => {
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <span
          role="button"
          tabIndex={0}
          aria-label="More information"
          onClick={(e) => e.preventDefault()}
          className={
            "inline-flex items-center justify-center align-middle text-muted-foreground hover:text-foreground transition-colors cursor-help ml-1 " +
            (className ?? "")
          }
        >
          <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
        {text}
      </TooltipContent>
    </Tooltip>
  );
};

export default InfoTooltip;
