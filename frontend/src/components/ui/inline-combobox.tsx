"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface InlineComboboxProps {
    items: { value: string; label: string; subLabel?: string }[]
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    disabled?: boolean
}

export function InlineCombobox({
    items,
    value,
    onChange,
    placeholder = "Select item...",
    className,
    disabled
}: InlineComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [selectedIndex, setSelectedIndex] = React.useState(0)

    // Reset search query and index when popover opens/closes
    React.useEffect(() => {
        if (!open) {
            setSearchQuery("")
            setSelectedIndex(0)
        }
    }, [open])

    // Find selected item to display label
    const selectedItem = items.find((item) => item.value === value)

    const filteredItems = React.useMemo(() => {
        if (!searchQuery) return items;
        const lowerQuery = searchQuery.toLowerCase();
        
        return items.filter(item =>
            item.label.toLowerCase().includes(lowerQuery) ||
            (item.subLabel && item.subLabel.toLowerCase().includes(lowerQuery))
        );
    }, [items, searchQuery])

    // Reset selected index when filtered items change
    React.useEffect(() => {
        setSelectedIndex(0)
    }, [filteredItems])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!open) return;
        
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (filteredItems[selectedIndex]) {
                const item = filteredItems[selectedIndex];
                onChange(item.value === value ? "" : item.value);
                setOpen(false);
            }
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between font-normal", !value && "text-muted-foreground", className)}
                    disabled={disabled}
                >
                    {selectedItem ? (
                        <span className="flex flex-col items-start text-left">
                            <span>{selectedItem.label}</span>
                            {selectedItem.subLabel && <span className="text-xs text-muted-foreground">{selectedItem.subLabel}</span>}
                        </span>
                    ) : (
                        placeholder
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent 
                className="w-[--radix-popover-trigger-width] p-0" 
                align="start"
                onKeyDown={handleKeyDown}
            >
                <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <Input
                        placeholder={`Search ${placeholder.toLowerCase()}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>
                <div className="max-h-[300px] overflow-y-auto p-1">
                    {filteredItems.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            No item found.
                        </div>
                    ) : (
                        <ul className="w-full">
                            {filteredItems.map((item, index) => (
                                <li
                                    key={item.value}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    onMouseDown={(e) => {
                                        e.preventDefault(); // Prevents input from losing focus if needed
                                        onChange(item.value === value ? "" : item.value);
                                        setOpen(false);
                                    }}
                                    className={cn(
                                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                                        selectedIndex === index ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground",
                                        value === item.value && "font-medium"
                                    )}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === item.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span>{item.label}</span>
                                        {item.subLabel && <span className="text-xs text-muted-foreground">{item.subLabel}</span>}
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
