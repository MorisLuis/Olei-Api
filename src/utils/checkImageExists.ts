import fetch from 'node-fetch';
import ProductInterface from "../interface/product";

interface getImageInterface {
    baseSQL: string,
    Codigo: string,
    product: ProductInterface
}

export const getProductWithImages = async ({
    baseSQL,
    Codigo,
    product
}: getImageInterface): Promise<typeof product> => {

    if (baseSQL && baseSQL.length > 0) {
        const formatImageDB = baseSQL.split('_');
        const imageDB = formatImageDB[formatImageDB.length - 1].toLocaleLowerCase();

        // Número máximo de intentos para encontrar la imagen
        const maxAttempts = 5;
        let attempt = 0;
        let images = [];

        while (attempt < maxAttempts) {
            let imageUrl;
            if (attempt === 0) {
                imageUrl = `https://oleistorage.blob.core.windows.net/${imageDB.trim()}/${Codigo.trim()}.jpg`;
            } else {
                imageUrl = `https://oleistorage.blob.core.windows.net/${imageDB.trim()}/${Codigo.trim()}_${attempt}.jpg`;
            }

            // Verifica si la imagen existe
            const imageExists = await checkImageExist(imageUrl);

            if (imageExists) {
                images.push({
                    url: imageUrl,
                    id: attempt
                });
            }
            attempt++;
        };

        if (images.length > 0) {
            // Se encontraron imágenes existentes
            product.imagenes = images;
        }
    }

    return product
};

export const getProductsWithImage = async (products: ProductInterface[]): Promise<ProductInterface[]> => {

    const productsWithImages = await Promise.all(
        products.map(async (product: ProductInterface) => {
            let imageExists : boolean = false;
            if (product.imagen) {
                imageExists = await checkImageExist(product.imagen);
            }
            return {
                ...product,
                imagen: imageExists ? product.imagen : null // O 'undefined' si prefieres
            };
        })
    );

    return productsWithImages;
};


export const checkImageExist = async (url: string): Promise<boolean> => {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
};
