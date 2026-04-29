import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { REPORT_ITEMS, type ReportId } from "../reports";
import { cn } from "./ui/utils";

type ViewMenuProps = {
  reportsSectionEnabled: boolean;
  onReportsSectionEnabledChange: (value: boolean) => void;
  reportVisibility: Record<ReportId, boolean>;
  onReportVisibilityChange: (id: ReportId, value: boolean) => void;
  archivedBoxesVisible: boolean;
  onArchivedBoxesVisibleChange: (value: boolean) => void;
  className?: string;
};

export function ViewMenu({
  reportsSectionEnabled,
  onReportsSectionEnabledChange,
  reportVisibility,
  onReportVisibilityChange,
  archivedBoxesVisible,
  onArchivedBoxesVisibleChange,
  className,
}: ViewMenuProps) {
  return (
    <div className={cn(className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="rounded-md border-sky-200 bg-sky-100 px-3 py-2 text-sky-700 shadow-none hover:bg-sky-200 hover:text-sky-800"
          >
            View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[14rem] p-1">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="pl-2">
              Sort
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="p-1">
              <DropdownMenuItem disabled className="text-muted-foreground">
                Name
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="text-muted-foreground">
                Date
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="pl-2">
              Layout
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="p-1">
              <DropdownMenuItem disabled className="text-muted-foreground">
                Grid
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="text-muted-foreground">
                List
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              className="flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-2 [&>svg:last-child]:ml-auto"
              onPointerDown={(e) => {
                const t = e.target as HTMLElement;
                if (t.closest("[data-slot=checkbox]")) e.preventDefault();
              }}
            >
              <span
                className="flex shrink-0 items-center"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Checkbox
                  checked={reportsSectionEnabled}
                  onCheckedChange={(v) =>
                    onReportsSectionEnabledChange(v === true)
                  }
                  className="size-4 rounded border-sky-300 data-[state=checked]:border-sky-600 data-[state=checked]:bg-sky-600"
                  aria-label="Pokaż sekcję raportów"
                />
              </span>
              <span className="flex-1 text-left text-sm">Reports</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="min-w-[12rem] p-1">
              {REPORT_ITEMS.map((r) => (
                <DropdownMenuCheckboxItem
                  key={r.id}
                  checked={reportVisibility[r.id]}
                  onCheckedChange={(v) => onReportVisibilityChange(r.id, v === true)}
                  onSelect={(e) => e.preventDefault()}
                  className="pl-8 [&_svg]:text-sky-600"
                >
                  {r.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuCheckboxItem
            checked={archivedBoxesVisible}
            onCheckedChange={(v) => onArchivedBoxesVisibleChange(v === true)}
            className="pl-8"
          >
            Archived boxes
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
