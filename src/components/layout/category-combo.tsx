import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { Button } from "../ui/button";
import type { CategoryType } from "../../../types/categoryType";
 import { ChevronDown, ChevronUp } from 'lucide-react';
  
export function ComboboxCategorys({ category }: { category: CategoryType[] }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="border-none flex items-center justify-between hover:border-b-2 hover:border-primary"
          role="combobox"
        >
          <span>
            {value || category?.map((cat) => cat.Category.name).join(", ")}
          </span>
          {open ? (
            <ChevronUp className="ml-2 h-5 w-5 text-primary" />
          ) : (
            <ChevronDown className="ml-2 h-5 w-5 text-primary" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full max-w-sm">
        <Command>
          <CommandInput placeholder="Buscar categorias..." />
          <CommandList>
            <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
            {category?.map((cat) => (
              <CommandGroup key={cat.Category.id} heading={cat.Category.name}>
                {cat.Category.children?.map((subCat) => (
                  <CommandItem
                    key={subCat.Category.id}
                    onSelect={() => {
                      setValue(subCat.Category.name);
                      setOpen(false);
                    }}
                  >
                    <span>{subCat.Category.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
