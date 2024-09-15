import { useState } from 'react';
//import axiosClient from '../network/axiosClient';
import { useRouter } from 'next/router';

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/Register/ui/button"
// Form - https://ui.shadcn.com/docs/components/form
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/Register/ui/form"
import { Input } from '@/components/components/ui/input';

// Radiogrp - https://ui.shadcn.com/docs/components/radio-group#form
import { label } from '@/components/Register/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/Register/ui/radio-group"

//Hovercard - https://ui.shadcn.com/docs/components/hover-card
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/Register/ui/hover-card"

const formSchema = z.object({

    entityName: z.string().min(2, {
        message: "Business Entity name must be at least 2 characters.",
    }).max(100),
    location: z.string().min(10, {
        message: "location must be at least 10 characters.",
    }).max(100),
    category: z.enum(["specialityretail", "foodnbeverage", "workhomelifestyle", "generalretail", "wholesalenlogistics"], {
        required_error: "You need to select a notification type.",
        message: "Please select a valid category.",
    }),
})

const Register = () => {

    const router = useRouter();

    // 1. Define your form, Initialize the useForm hook with zod schema validation
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            entityName: "",
            location: "",
            category: "",
        },
    })

    // 2. Define a submit handler.
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
        /* TO ADD IN IN FUTUR
            try {
              const response = await axiosClient.post('/api/business/register', {
                entityName: values.entityName,
                location: values.location,
                category: values.category,
              });
        
              if (response.status === 201) {
                router.push('/login'); // Redirect to login or dashboard after successful registration
              }
            } catch (error) {
              console.log('Registration failed. Please try again.');
            }
        */
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Business Entity Name */}
                <FormField
                    control={form.control}
                    name="entityName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Business Entity Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Your Business Name" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the name of your business entity.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* Business Location */}
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                                <Input placeholder="Your Business Full Address" {...field} />
                            </FormControl>
                            <FormDescription>
                                Enter the primary location of your business.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Business Category */}
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>

                            <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                            >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="specialityretail" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                        Speciality Retail
                                    </FormLabel>
                                    <HoverCard>
                                        <HoverCardTrigger ></HoverCardTrigger>
                                        <HoverCardContent>
                                            Floristry, Newsagents, Stationery & Bookshops, Community Pharmacy, Specialty Stores, Jewellery, Fashion, Clothing & Footwear
                                        </HoverCardContent>
                                    </HoverCard>
                                </FormItem>

                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="foodnbeverage" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                        Food and Beverage
                                    </FormLabel>
                                    <HoverCard>
                                        <HoverCardTrigger></HoverCardTrigger>
                                        <HoverCardContent>
                                            Supermarkets; Liquor; Fruit & Vegetable; Fast Food & Take-away;
                                        </HoverCardContent>
                                    </HoverCard>
                                </FormItem>

                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="workhomelifestyle" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Work, Home and Lifestyle</FormLabel>
                                    <HoverCard>
                                        <HoverCardTrigger></HoverCardTrigger>
                                        <HoverCardContent>
                                            Entertainment, Communication & Technology; Sport, Recreation & Leisure; Home Living; Hardware, Trade & Gardening
                                        </HoverCardContent>
                                    </HoverCard>
                                </FormItem>

                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="generalretail" />
                                    </FormControl>
                                    <FormLabel className="font-normal">General Retail</FormLabel>
                                    <HoverCard>
                                        <HoverCardTrigger></HoverCardTrigger>
                                        <HoverCardContent>
                                            Department Stores; Discount & Variety
                                        </HoverCardContent>
                                    </HoverCard>
                                </FormItem>

                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="wholesalenlogistics" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Wholesale and Logistics</FormLabel>
                                    <HoverCard>
                                        <HoverCardContent>
                                            Wholesale; Distribution; Warehousing; Transport & Logistics
                                        </HoverCardContent>
                                    </HoverCard>
                                </FormItem>

                            </RadioGroup>

                            <FormDescription>
                                Choose the category your business operates in.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit">Register</Button>
            </form>
        </Form>
    )
        ;
};

export default Register;