import { hash } from "bcrypt";
import { prisma } from "../config/db.js";

async function seedAdmin() {
  try {
    const hashedPassword = await hash("12345", 12);
    
    const admin = await prisma.mUser.create({
      data: {
        email: "admin@gmail.com",
        password: hashedPassword,
        role: "Admin",
        statusAkun: "Aktif",
        mustChangePassword: false,
        createdBy: "system",
        updatedBy: "system",
      },
    });

    console.log("Admin berhasil dibuat:", admin.email);
  } catch (error) {
    console.error("Gagal membuat admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
