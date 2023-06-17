const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const testConnection = async () => {
    try {
        await prisma.$connect;
        console.log('Ket noi thanh cong');
    } catch (error) {
        console.log('Loi ket noi');
    }
};

testConnection();
