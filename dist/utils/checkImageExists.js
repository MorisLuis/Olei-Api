"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkImageExist = exports.getProductsWithImage = exports.getProductWithImages = void 0;
;
const getProductWithImages = async ({ baseSQL, Codigo, product }) => {
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
            }
            else {
                imageUrl = `https://oleistorage.blob.core.windows.net/${imageDB.trim()}/${Codigo.trim()}_${attempt}.jpg`;
            }
            // Verifica si la imagen existe
            const imageExists = await (0, exports.checkImageExist)(imageUrl);
            if (imageExists) {
                images.push({
                    url: imageUrl,
                    id: attempt
                });
            }
            attempt++;
        }
        ;
        if (images.length > 0) {
            // Se encontraron imágenes existentes
            product.imagenes = images;
        }
    }
    return product;
};
exports.getProductWithImages = getProductWithImages;
const getProductsWithImage = async (products) => {
    const productsWithImages = await Promise.all(products.map(async (product) => {
        let imageExists = false;
        if (product.imagen) {
            imageExists = await (0, exports.checkImageExist)(product.imagen);
        }
        return {
            ...product,
            imagen: imageExists ? product.imagen : null // O 'undefined' si prefieres
        };
    }));
    return productsWithImages;
};
exports.getProductsWithImage = getProductsWithImage;
const checkImageExist = async (url) => {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    }
    catch {
        return false;
    }
};
exports.checkImageExist = checkImageExist;
//# sourceMappingURL=checkImageExists.js.map