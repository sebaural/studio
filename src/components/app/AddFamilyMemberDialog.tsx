'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parse, parseISO, isValid } from 'date-fns';
import { CalendarIcon, UserPlus, XIcon, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

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
  spouse: z.string().optional().nullable(),
});

type AddFamilyMemberDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (member: FamilyMember) => void;
  existingMember?: FamilyMember;
  allMembers: FamilyMember[];
  isSaving: boolean;
};

export default function AddFamilyMemberDialog({
  isOpen,
  onOpenChange,
  onSave,
  existingMember,
  allMembers,
  isSaving,
}: AddFamilyMemberDialogProps) {
  const t = useTranslations('AddFamilyMemberDialog');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      birthplace: '',
      bio: '',
      photoUrl: PlaceHolderImages[0]?.imageUrl || '',
      parents: [],
      spouse: null,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (existingMember) {
        form.reset({
          name: existingMember.name,
          birthDate: existingMember.birthDate ? parseISO(existingMember.birthDate) : undefined,
          deathDate: existingMember.deathDate ? parseISO(existingMember.deathDate) : undefined,
          birthplace: existingMember.birthplace,
          bio: existingMember.bio,
          photoUrl: existingMember.photoUrl,
          parents: existingMember.parents || [],
          spouse: existingMember.spouse || null,
        });
      } else {
        form.reset({
          name: '',
          birthplace: '',
          bio: '',
          photoUrl: PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)]?.imageUrl || '',
          parents: [],
          spouse: null,
          deathDate: undefined,
        });
      }
    }
  }, [isOpen, existingMember, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const photoData = PlaceHolderImages.find(p => p.imageUrl === values.photoUrl);
    const memberData: FamilyMember = {
      id: existingMember?.id || new Date().toISOString() + Math.random(),
      ...values,
      spouse: values.spouse || undefined,
      birthDate: format(values.birthDate as Date, 'yyyy-MM-dd'),
      deathDate: values.deathDate ? format(values.deathDate as Date, 'yyyy-MM-dd') : undefined,
      bio: values.bio ?? '',
      parents: values.parents ?? [],
      photoHint: photoData?.imageHint || 'person',
      children: existingMember?.children || [],
    };
    onSave(memberData);
  };
  
  const selectableMembers = allMembers.filter(m => m.id !== existingMember?.id);

  const handleParentSelect = (parentId: string) => {
    const currentParents = form.getValues('parents') || [];
    if (currentParents.length < 2 && !currentParents.includes(parentId)) {
      form.setValue('parents', [...currentParents, parentId]);
    }
  }

  const handleParentRemove = (parentId: string) => {
    const currentParents = form.getValues('parents') || [];
    form.setValue('parents', currentParents.filter(id => id !== parentId));
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:sm:max-w-2xl bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-6 h-6" />
            {existingMember ? t('editTitle') : t('addTitle')}
          </DialogTitle>
          <DialogDescription>
            {existingMember ? t('editDescription') : t('addDescription')}
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
                    <FormLabel>{t('fullNameLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('fullNamePlaceholder')} {...field} />
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
                    <FormLabel>{t('birthplaceLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('birthplacePlaceholder')} {...field} />
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
                    <FormLabel>{t('birthDateLabel')}</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="yyyy-mm-dd"
                          value={
                            field.value instanceof Date && isValid(field.value)
                              ? format(field.value, 'yyyy-MM-dd')
                              : typeof field.value === 'string'
                              ? field.value
                              : ''
                          }
                          onChange={(e) => {
                            const date = parse(e.target.value, 'yyyy-MM-dd', new Date());
                            if (isValid(date)) {
                              // cast to any because form schema expects a Date
                              field.onChange(date as any);
                            } else {
                              field.onChange(e.target.value as any);
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
                              selected={field.value instanceof Date && isValid(field.value) ? field.value : undefined}
                              onSelect={(d) => field.onChange(d as any)}
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
                    <FormLabel>{t('deathDateLabel')}</FormLabel>
                     <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="yyyy-mm-dd"
                          value={
                            field.value instanceof Date && isValid(field.value)
                              ? format(field.value, 'yyyy-MM-dd')
                              : typeof field.value === 'string'
                              ? field.value
                              : ''
                          }
                          onChange={(e) => {
                            const date = parse(e.target.value, 'yyyy-MM-dd', new Date());
                            if (isValid(date)) {
                              field.onChange(date as any);
                            } else {
                              field.onChange(e.target.value as any);
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
                            selected={field.value instanceof Date && isValid(field.value) ? field.value : undefined}
                            onSelect={(d) => field.onChange(d as any)}
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
                    <FormLabel>{t('parentsLabel')}</FormLabel>
                    <Select onValueChange={handleParentSelect} value="">
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('parentsPlaceholder')} />
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
                     <div className="flex flex-wrap gap-2 mt-2">
                      {field.value?.map(pId => {
                        const parent = allMembers.find(m => m.id === pId);
                        return parent ? (
                          <span key={pId} className="flex items-center gap-1 text-sm bg-secondary text-secondary-foreground py-1 px-2 rounded-md">
                            {parent.name}
                            <button onClick={() => handleParentRemove(pId)} className="rounded-full hover:bg-black/10">
                              <XIcon className="w-3 h-3" />
                            </button>
                          </span>
                        ) : null;
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
                    <FormLabel>{t('spouseLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''} >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('spousePlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">{t('spouseNone')}</SelectItem>
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
                    <FormLabel>{t('bioLabel')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t('bioPlaceholder')} {...field} />
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
                    <FormLabel>{t('photoLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('photoPlaceholder')} />
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
                {t('cancelButton')}
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <><Loader2 className="animate-spin" /> {t('savingButton')}</> : t('saveButton')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
