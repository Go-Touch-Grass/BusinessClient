import { useState } from 'react';
//import axiosClient from '../network/axiosClient';
import { useRouter } from 'next/router';

import Cookies from 'js-cookie';

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
import { RadioGroup, RadioGroupItem } from "@/components/Register/ui/radio-group"

//Hovercard - https://ui.shadcn.com/docs/components/hover-card
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/Register/ui/hover-card"
import api from '@/api';



const formSchema = z.object({

    entityName: z
        .string()
        .min(2, {
            message: "Business Entity name must be at least 2 characters.",
        })
        .regex(/(Pte\s*Ltd|Ltd|Unlimited)\s*$/i, { // \s* any spaces before or after, /i case insensitive
            message: 'Business name must end with "Pte Ltd", "Ltd", or "Unlimited".',
        }).max(100),
    location: z.string().min(10, {
        message: "location must be at least 10 characters.",
    }).max(100),
    category: z.enum(["specialityretail", "foodnbeverage", "workhomelifestyle", "generalretail", "wholesalenlogistics"], {
        required_error: "You need to select a notification type.",
        message: "Please select a valid category.",
    }),

    proof: z
        .instanceof(File)
        .refine((file) => !!file, { message: "File is required" })// Ensure a file exists
        .refine((file) => file.size <= 5000000, { message: "File size should be less than 5MB" })// Validate size only if a file exists
        .refine((file) => ["application/pdf", "image/jpeg", "image/png"].includes(file.type), {
            message: "File must be a PDF, JPG, or PNG", // Check the file type
        }),
    /*
        proof: z
            .any()
             //.array(z.instanceof(File)) // Ensure proof is an array of files
            //.min(1, "File is required") // Ensure at least one file is uploaded
            .refine((files) => files && files.length > 0, { // Ensure file exists and not empty
                message: "File is required"
            })
            .refine((file) => {
                console.log(file); // Check what is being passed here
                return !!file;
            }, {
                message: "File is required",
            })
            .refine((files) => files[0]?.size <= 5000000, {
                message: "File size should be less than 5MB",
            })
            .refine((files) => ["application/pdf", "image/jpeg", "image/png"].includes(files[0]?.type), {
                message: "File must be a PDF, JPG, or PNG"
            }),
    */
})

const Register = () => {

    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [businessType, setBusinessType] = useState("Pte Ltd"); // Default value for dropdown
    const [combinedName, setCombinedName] = useState(""); // To store combined name (input + dropdown)


    // 1. Define your form, Initialize the useForm hook with zod schema validation
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            entityName: "",
            location: "",
            category: undefined,
            //proof: null,
            proof: undefined,
        },
    })

    // 2. Define a submit handler.
    const onSubmit = async (values: z.infer<typeof formSchema>) => {

        console.log("values", values)


        const formData = new FormData();
        formData.append("entityName", values.entityName);
        formData.append("location", values.location);
        formData.append("category", values.category);
        //formData.append("proof", values.proof[0]); // Add the uploaded file
        formData.append("proof", values.proof); // Add the uploaded file

        const username = Cookies.get('username');
        if (!username) {
            setError('No username found in cookies');
            return;
        }
        formData.append("username", username);

        /* TO ADD IN IN FUTUR
            try {
              const response = await axiosClient.post('/api/business/registerBusiness', {
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

        try {
            const response = await api.post('/api/business/registerBusiness', formData, { //route need match backend.
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 201 || response.status === 200) {
                setSuccess('Successfully applied!');
                // Redirect to profile page
                router.push('/profile');
            } else {
                setError(response.data.message || 'Something went wrong');
            }
        } catch (err) {
            setError('An error occurred');
            console.log('API call error:', err);
        }

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
                            {/* Container with flexbox to position input and dropdown side by side */}
                            <div className="flex items-center space-x-4">
                                {/* Input for entity name */}
                                <FormControl>
                                    <Input placeholder="Your Business Name" {...field}
                                    />
                                </FormControl>
                            </div>
                            <FormDescription>
                                This is the name of your business entity, must include "Pte Ltd", "Ltd", or "Unlimited".
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


                {/* File Upload for Business Proof */}
                <FormField
                    control={form.control}
                    name="proof"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Upload Proof (PDF, JPG, PNG)</FormLabel>
                            <FormControl>
                                {/*<Input type="file" accept=".pdf, .jpg, .png" {...field} /> */}
                                <Input
                                    type="file"
                                    accept=".pdf, .jpg, .png"
                                    onChange={(e) => field.onChange(e.target.files?.[0])} // Handle files correctly
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {error && <p className='text-red-500 text-sm mb-4'>{error}</p>}
                {success && <p className='text-green-500 text-sm mb-4'>{success}</p>}
                <Button type="submit">Register</Button>
            </form>
        </Form>
    )
        ;
};

export default Register;