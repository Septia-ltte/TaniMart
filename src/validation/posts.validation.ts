
import { z } from "zod";

const optionalDateSchema = z.preprocess(
    (value) => {
        if (value === "" || value === undefined) {
            return undefined;
        }

        return value;
    },
    z.coerce.date().optional()
);

// PRODUCT TYPE
const productTypeEnum = z.enum([
    "regular",
    "package",
    "surprise_bag",
    "pre_order",
]);

// PRODUCT STATUS
const productStatusEnum = z.enum([
    "published",
    "inactive",
]);

// PRODUCT FIELDS
const productFieldsSchema = z.object({
    farmerId: z.coerce
        .number()
        .int()
        .positive("Farmer ID tidak valid"),

    categoryId: z.coerce
        .number()
        .int()
        .positive("Category ID tidak valid"),

    title: z
        .string()
        .trim()
        .min(3, "Title minimal 3 karakter")
        .max(255, "Title maksimal 255 karakter"),

    description: z
        .string()
        .trim()
        .min(10, "Description minimal 10 karakter")
        .max(1000, "Description maksimal 1000 karakter"),

    type: productTypeEnum,

    price: z.coerce
        .number()
        .positive("Price harus lebih dari 0"),

    stock: z.coerce
        .number()
        .int()
        .min(0, "Stock tidak boleh negatif"),

    unit: z
        .string()
        .trim()
        .min(1, "Unit wajib diisi")
        .max(50, "Unit maksimal 50 karakter"),

    harvestDate: optionalDateSchema,

    preOrder: optionalDateSchema,

    status: productStatusEnum.optional(),
});

// CREATE PRODUCT
export const createPostSchema = productFieldsSchema
    .omit({
        status: true,
    })
    .refine(
        (data) =>
            !data.harvestDate ||
            !data.preOrder ||
            data.preOrder <= data.harvestDate,
        {
            message: "Pre-order tidak boleh setelah harvest date",
            path: ["preOrder"],
        }
    );


// PRODUCT ID
export const productIdSchema = z.object({
    id: z.coerce
        .number()
        .int()
        .positive("Product ID tidak valid"),
});


// UPDATE PRODUCT PARAMS
export const updateProductParamsSchema = productIdSchema;


// UPDATE PRODUCT
export const updateProductSchema = productFieldsSchema
    .omit({
        farmerId: true,
    })
    .partial()
    .refine(
        (data) =>
            !data.harvestDate ||
            !data.preOrder ||
            data.preOrder <= data.harvestDate,
        {
            message: "Pre-order tidak boleh setelah harvest date",
            path: ["preOrder"],
        }
    );


