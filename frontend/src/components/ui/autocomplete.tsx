"use client"

import * as React from "react"
import { Check, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover"

export interface AutocompleteItem {
    value: string;
    label: string;
    subLabel?: string;
    tertiaryLabel?: string;
}

interface AutocompleteProps {
    items: AutocompleteItem[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    emptyMessage?: string;
}

export function Autocomplete({
    items,
    value,
    onChange,
    placeholder = "Search...",
    className,
    disabled = false,
    emptyMessage = "No results found."
}: AutocompleteProps) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [isFocused, setIsFocused] = React.useState(false)
    const anchorRef = React.useRef<HTMLDivElement>(null)

    const getFullText = (item: AutocompleteItem) => {
        return [item.label, item.subLabel, item.tertiaryLabel]
            .filter(Boolean)
            .join(' - ')
    }

    // Sync input with selected value on mount or external value change
    React.useEffect(() => {
        if (value) {
            const selected = items.find(item => item.value === value)
            if (selected) {
                if (!isFocused) {
                    setSearchQuery(getFullText(selected))
                }
            } else {
                setSearchQuery("")
            }
        } else {
            if (!isFocused) {
                setSearchQuery("")
            }
        }
    }, [value, items, isFocused])

    // Local filtering
    const filteredItems = React.useMemo(() => {
        if (!searchQuery) return items;
        const lowerQuery = searchQuery.toLowerCase();
        return items.filter(item =>
            item.label.toLowerCase().includes(lowerQuery) ||
            (item.subLabel && item.subLabel.toLowerCase().includes(lowerQuery)) ||
            (item.tertiaryLabel && item.tertiaryLabel.toLowerCase().includes(lowerQuery))
        )
    }, [items, searchQuery])

    // "Show the dropdown only when the input is focused and has at least one character typed."
    const shouldShowDropdown = isFocused && searchQuery.length >= 1;

    React.useEffect(() => {
        if (shouldShowDropdown) {
            setOpen(true)
        } else {
            setOpen(false)
        }
    }, [shouldShowDropdown])

    const handleSelect = (item: AutocompleteItem) => {
        onChange(item.value)
        setSearchQuery(getFullText(item))
        setOpen(false)
        setIsFocused(false)
    }

    const revertSearchQuery = React.useCallback(() => {
        const selected = items.find(i => i.value === value)
        if (selected) {
            setSearchQuery(getFullText(selected))
        } else {
            setSearchQuery("")
        }
    }, [items, value])

    // Calculate width of the anchor to constrain popover
    const contentWidth = anchorRef.current ? anchorRef.current.offsetWidth : undefined;

    return (
        <Popover open={open} onOpenChange={(o) => {
            if (!o) {
                setOpen(false)
                setIsFocused(false)
                revertSearchQuery()
            }
        }}>
            <PopoverAnchor asChild>
                <div ref={anchorRef} className={cn("relative w-full", className)}>
                    <Input
                        type="text"
                        placeholder={placeholder}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            if (!open && e.target.value.length >= 1) {
                                setOpen(true)
                            }
                        }}
                        onFocus={() => setIsFocused(true)}
                        disabled={disabled}
                        className={cn("w-full pr-8", (open && filteredItems.length > 0) && "rounded-b-none")}
                    />
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
                </div>
            </PopoverAnchor>
            <PopoverContent
                className="p-0 border-t-0 rounded-t-none"
                style={{ width: contentWidth }}
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
                onInteractOutside={() => {
                    setIsFocused(false);
                    setOpen(false);
                    revertSearchQuery();
                }}
            >
                <div className="max-h-60 overflow-y-auto w-full p-1 bg-popover text-popover-foreground shadow-md rounded-b-md">
                    {filteredItems.length === 0 ? (
                        <div className="p-4 text-sm text-center text-muted-foreground">
                            {emptyMessage}
                        </div>
                    ) : (
                        <ul className="w-full">
                            {filteredItems.map(item => (
                                <li
                                    key={item.value}
                                    onMouseDown={(e) => {
                                        // prevent default to keep input focus if desired, or just let click happen
                                        e.preventDefault();
                                        handleSelect(item);
                                    }}
                                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === item.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-foreground">{item.label}</span>
                                        {item.subLabel && <span className="text-xs text-muted-foreground">{item.subLabel}</span>}
                                        {item.tertiaryLabel && <span className="text-xs text-muted-foreground">{item.tertiaryLabel}</span>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
