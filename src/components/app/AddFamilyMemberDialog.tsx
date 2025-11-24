'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parse, parseISO } from 'date-fns';
import { CalendarIcon, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { FamilyMember } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  birthDate: z.date({ required_error: 'A birth date is required.' }),
  deathDate: z.date().optional(),
  birthplace: z.string().min(2, { message: 'Birthplace must be at least 2 characters.' }),
  bio: z.string().max(500, { message: 'Biography cannot exceed 500 characters.' }).optional(),
  photoUrl: z.string().url({ message: 'Please select a valid photo.' }),
  parents: z.array(z.string()).max(2).optional(),
  spouse: z.string().optional(),
});

type AddFamilyMemberDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (member: FamilyMember) => void;
  existingMember?: FamilyMember;
  allMembers: FamilyMember[];
};

export default function AddFamilyMemberDialog({
  isOpen,
  onOpenChange,
  onSave,
  existingMember,
  allMembers,
}: AddFamilyMemberDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      birthplace: '',
      bio: '',
      photoUrl: PlaceHolderImages[0]?.imageUrl || '',
      parents: [],
      spouse: '',
    },
  });

  useEffect(() => {
    if (isOpen && existingMember) {
      form.reset({
        name: existingMember.name,
        birthDate: existingMember.birthDate ? parseISO(existingMember.birthDate) : undefined,
        deathDate: existingMember.deathDate ? parseISO(existingMember.deathDate) : undefined,
        birthplace: existingMember.birthplace,
        bio: existingMember.bio,
        photoUrl: existingMember.photoUrl,
        parents: existingMember.parents,
        spouse: existingMember.spouse,
      });
    } else if (isOpen && !existingMember) {
      form.reset({
        name: '',
        birthplace: '',
        bio: '',
        photoUrl: PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)]?.imageUrl || '',
        parents: [],
        spouse: '',
      });
    }
  }, [isOpen, existingMember, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const photoData = PlaceHolderImages.find(p => p.imageUrl === values.photoUrl);
    const memberData: FamilyMember = {
      id: existingMember?.id || new Date().toISOString() + Math.random(),
      ...values,
      birthDate: format(values.birthDate, 'yyyy-MM-dd'),
      deathDate: values.deathDate ? format(values.deathDate, 'yyyy-MM-dd') : undefined,
      photoHint: photoData?.imageHint || 'person',
      children: existingMember?.children || [],
    };
    onSave(memberData);
  };
  
  const selectableMembers = allMembers.filter(m => m.id !== existingMember?.id);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:sm:max-w-2xl bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-6 h-6" />
            {existingMember ? 'Edit Family Member' : 'Add Family Member'}
          </DialogTitle>
          <DialogDescription>
            {existingMember ? 'Update the details of this family member.' : 'Enter the details for a new family member.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthplace"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birthplace</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., London, England" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="yyyy-mm-dd"
                          value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                          onChange={(e) => {
                            const date = parse(e.target.value, 'yyyy-MM-dd', new Date());
                            if (!isNaN(date.getTime())) {
                              field.onChange(date);
                            }
                          }}
                        />
                      </FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                          >
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date('1700-01-01')}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deathDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Death (optional)</FormLabel>
                     <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="yyyy-mm-dd"
                          value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                          onChange={(e) => {
                            const date = parse(e.target.value, 'yyyy-MM-dd', new Date());
                             if (!isNaN(date.getTime())) {
                              field.onChange(date);
                            }
                          }}
                        />
                      </FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                          >
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date('1700-01-01')}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="parents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parents</FormLabel>
                    <Select onValueChange={(value) => field.onChange(field.value ? [...field.value, value] : [value])}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select up to 2 parents" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectableMembers.map((m) => (
                           <SelectItem key={m.id} value={m.id} disabled={field.value?.includes(m.id)}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                     <div className="flex gap-2 mt-2">
                      {field.value?.map(pId => {
                        const parent = allMembers.find(m => m.id === pId);
                        return parent ? <span key={pId} className="text-sm bg-secondary text-secondary-foreground p-1 rounded-md">{parent.name}</span> : null;
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="spouse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spouse</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a spouse" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectableMembers.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='md:col-span-2'>
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Biography</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A short description of their life..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>

               <div className='md:col-span-2'>
               <FormField
                control={form.control}
                name="photoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Photo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a photo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PlaceHolderImages.map((p) => (
                          <SelectItem key={p.id} value={p.imageUrl}>
                            {p.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>

            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Member</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
