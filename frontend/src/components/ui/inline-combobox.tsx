"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList, // Add CommandList
} from "@/components/ui/command"
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

    // Find selected item to display label
    const selectedItem = items.find((item) => item.value === value)

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
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                    <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
                    <CommandList>
                        <CommandEmpty>No item found.</CommandEmpty>
                        <CommandGroup>
                            {items.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.label} // Command searches by value/label text usually. 
                                    // If we use item.value (ID), search might not work as expected if ID is UUID.
                                    // shadcn command usually filters by the content of CommandItem.
                                    onSelect={() => {
                                        onChange(item.value === value ? "" : item.value)
                                        setOpen(false)
                                    }}
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
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
