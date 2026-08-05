import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { hash } from "bcryptjs";
import path from "node:path";

const dbPath = `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
const adapter = new PrismaLibSql({ url: dbPath });
const prisma = new PrismaClient({ adapter });


async function main() {
  console.log("🌱 Iniciando seed do banco de dados CEPI...\n");

  // ============================================
  // ESCOLA
  // ============================================
  const school = await prisma.school.upsert({
    where: { id: "cepi-escola-1" },
    update: {},
    create: {
      id: "cepi-escola-1",
      name: "Centro Educacional Pequena Isa",
      slug: "cepi",
      city: "Grussaí",
      state: "RJ",
      address: "Av. Principal, 123 - Grussaí",
      phone: "(22) 99999-0000",
      email: "contato@cepigrussai.com.br",
    },
  });

  const academicYear = await prisma.academicYear.upsert({
    where: { year: 2025 },
    update: {},
    create: {
      year: 2025,
      startDate: new Date("2025-02-01"),
      endDate: new Date("2025-12-15"),
      active: true,
    },
  });

  console.log("✅ Escola e ano letivo criados");

  // ============================================
  // USUÁRIOS — Senhas hash
  // ============================================
  const adminPass = await hash("Admin@123", 12);
  const secretPass = await hash("Secret@123", 12);
  const teacherPass = await hash("Teacher@123", 12);
  const parentPass = await hash("Parent@123", 12);
  const studentPass = await hash("Student@123", 12);

  // Admin / Diretor
  await prisma.user.upsert({
    where: { email: "diretor@cepi.edu.br" },
    update: {},
    create: {
      name: "Diretora Maria Silva",
      email: "diretor@cepi.edu.br",
      passwordHash: adminPass,
      role: "ADMIN",
      phone: "(22) 99111-0001",
      cpf: "111.111.111-11",
    },
  });

  // Secretária
  await prisma.user.upsert({
    where: { email: "secretaria@cepi.edu.br" },
    update: {},
    create: {
      name: "Ana Paula Costa",
      email: "secretaria@cepi.edu.br",
      passwordHash: secretPass,
      role: "SECRETARY",
      phone: "(22) 99111-0002",
    },
  });

  // Professores
  const teacherUsersData = [
    { name: "Prof. Carlos Mendes", email: "carlos@cepi.edu.br", registration: "PROF001", dept: "Matemática" },
    { name: "Profa. Fernanda Lima", email: "fernanda@cepi.edu.br", registration: "PROF002", dept: "Português" },
    { name: "Prof. Ricardo Souza", email: "ricardo@cepi.edu.br", registration: "PROF003", dept: "Ciências" },
  ];

  const teachers: { user: any; profile: any }[] = [];
  for (const t of teacherUsersData) {
    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: {
        name: t.name,
        email: t.email,
        passwordHash: teacherPass,
        role: "TEACHER",
      },
    });
    const profile = await prisma.teacherProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        registration: t.registration,
        department: t.dept,
      },
    });
    teachers.push({ user, profile });
  }

  console.log("✅ Admin, Secretária e 3 Professores criados");

  // ============================================
  // TURMAS
  // ============================================
  const classes: any[] = [];
  const classData = [
    { name: "1º A", grade: "1º Ano EF" },
    { name: "2º A", grade: "2º Ano EF" },
    { name: "3º A", grade: "3º Ano EF" },
  ];

  for (const cd of classData) {
    const classId = `class-${cd.name.replace(" ", "").toLowerCase()}`;
    const cls = await prisma.class.upsert({
      where: { id: classId },
      update: {},
      create: {
        id: classId,
        name: cd.name,
        grade: cd.grade,
        shift: "Manhã",
        schoolId: school.id,
        academicYearId: academicYear.id,
        maxStudents: 30,
      },
    });
    classes.push(cls);

    await prisma.classTeacher.upsert({
      where: { classId_teacherId: { classId: cls.id, teacherId: teachers[0].profile.id } },
      update: {},
      create: { classId: cls.id, teacherId: teachers[0].profile.id },
    });
  }

  const firstClass = classes[0];
  const subjects: any[] = [];
  const subjectData = [
    { name: "Matemática", code: "MAT" },
    { name: "Português", code: "PORT" },
    { name: "Ciências", code: "CIE" },
    { name: "História", code: "HIS" },
    { name: "Geografia", code: "GEO" },
    { name: "Educação Física", code: "EDF" },
  ];

  for (const sd of subjectData) {
    const subj = await prisma.subject.upsert({
      where: { classId_code: { classId: firstClass.id, code: sd.code } },
      update: {},
      create: { name: sd.name, code: sd.code, classId: firstClass.id, workload: 80 },
    });
    subjects.push(subj);
  }

  console.log("✅ 3 Turmas e 6 Disciplinas criadas");

  // ============================================
  // ALUNOS E RESPONSÁVEIS
  // ============================================
  const studentsData = [
    { student: { name: "João Pedro Santos", email: "joao@cepi.edu.br", cpf: "222.222.222-22", registration: "2025001" },
      parent: { name: "Roberto Santos", email: "roberto.pai@email.com" } },
    { student: { name: "Maria Clara Oliveira", email: "maria@cepi.edu.br", cpf: "333.333.333-33", registration: "2025002" },
      parent: { name: "Carla Oliveira", email: "carla.mae@email.com" } },
    { student: { name: "Lucas Ferreira", email: "lucas@cepi.edu.br", cpf: "444.444.444-44", registration: "2025003" },
      parent: { name: "Jorge Ferreira", email: "jorge.pai@email.com" } },
    { student: { name: "Isabela Rodrigues", email: "isabela@cepi.edu.br", cpf: "555.555.555-55", registration: "2025004" },
      parent: { name: "Sandra Rodrigues", email: "sandra.mae@email.com" } },
  ];

  const baseGrades = [8.5, 7.0, 9.0, 6.5, 7.8, 10.0];

  for (const sd of studentsData) {
    const studentUser = await prisma.user.upsert({
      where: { email: sd.student.email },
      update: {},
      create: { name: sd.student.name, email: sd.student.email, passwordHash: studentPass, role: "STUDENT", cpf: sd.student.cpf },
    });

    const studentProfile = await prisma.studentProfile.upsert({
      where: { userId: studentUser.id },
      update: {},
      create: { userId: studentUser.id, registration: sd.student.registration, birthDate: new Date("2016-06-15") },
    });

    await prisma.enrollment.upsert({
      where: { studentId_classId: { studentId: studentProfile.id, classId: firstClass.id } },
      update: {},
      create: { studentId: studentProfile.id, classId: firstClass.id, status: "ACTIVE" },
    });

    const parentUser = await prisma.user.upsert({
      where: { email: sd.parent.email },
      update: {},
      create: { name: sd.parent.name, email: sd.parent.email, passwordHash: parentPass, role: "PARENT" },
    });

    const parentProfile = await prisma.parentProfile.upsert({
      where: { userId: parentUser.id },
      update: {},
      create: { userId: parentUser.id },
    });

    await prisma.studentParent.upsert({
      where: { studentId_parentId: { studentId: studentProfile.id, parentId: parentProfile.id } },
      update: {},
      create: { studentId: studentProfile.id, parentId: parentProfile.id, relationship: "Pai/Mãe" },
    });

    // Notas — 1º e 2º Bimestre
    for (const period of ["1º Bimestre", "2º Bimestre"]) {
      for (let i = 0; i < subjects.length; i++) {
        const variation = (Math.random() * 1.5 - 0.75);
        const val = Math.min(10, Math.max(0, baseGrades[i] + variation));
        const gradeId = `grade-${studentProfile.id}-${subjects[i].id}-${period.replace(" ", "")}`;
        await prisma.grade.upsert({
          where: { id: gradeId },
          update: {},
          create: {
            id: gradeId,
            studentId: studentProfile.id,
            subjectId: subjects[i].id,
            teacherId: teachers[0].profile.id,
            period,
            value: Math.round(val * 10) / 10,
            type: "BIMESTRAL",
          },
        });
      }
    }

    // Boletos — Meses 1-8 de 2025
    for (let month = 1; month <= 8; month++) {
      const status = month < 6 ? "PAID" : month === 6 ? "OVERDUE" : "PENDING";
      await prisma.invoice.create({
        data: {
          studentId: studentProfile.id,
          description: `Mensalidade ${String(month).padStart(2, "0")}/2025`,
          amount: 850.0,
          dueDate: new Date(2025, month - 1, 10),
          paidAt: status === "PAID" ? new Date(2025, month - 1, 8) : null,
          status: status as any,
          month,
          year: 2025,
          barCode: `23793.38128 60007.727285 99000.063305 1 ${String(month).padStart(5, "0")}0000085000`,
          pixCode: `00020126580014br.gov.bcb.pix0136cepi-escola-${month}-${studentProfile.id.slice(0, 8)}5204000053039865406850.005802BR5923CEPI Grussai6014Rio de Janeiro62070503***63041D14`,
        },
      });
    }
  }

  console.log("✅ 4 Alunos com Responsáveis, Matrículas, Notas e Boletos criados");
  console.log("\n🎉 Seed concluído com sucesso!\n");
  console.log("👤 CONTAS DE ACESSO:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔑 Diretor:    diretor@cepi.edu.br       / Admin@123  (MFA: configurar na 1ª entrada)");
  console.log("🔑 Secretária: secretaria@cepi.edu.br    / Secret@123 (MFA: configurar na 1ª entrada)");
  console.log("🔑 Professor:  carlos@cepi.edu.br        / Teacher@123");
  console.log("🔑 Responsável:roberto.pai@email.com     / Parent@123");
  console.log("🔑 Aluno:      joao@cepi.edu.br          / Student@123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
