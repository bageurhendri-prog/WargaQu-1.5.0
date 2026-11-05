export interface FamilyNode {
  id: string;
  name: string;
  gen: number; // -3: Uyut, -2: Kakek/Nenek, -1: Orang Tua/Paman/Bibi, 0: User & Saudara, 1: Anak, 2: Cucu, 3: Cicit
  order: string;
  quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  claimed: boolean;
  parentId?: string;
  gender?: 'L' | 'P';
  role?: string;
  isUser?: boolean;
  spouseName?: string;
  spouseGender?: 'L' | 'P';
  relationType?: 'user' | 'kakak' | 'adik' | 'pasangan' | 'saudara' | 'leluhur' | 'keturunan';
  birthYear?: string;
  deathYear?: string;
  status?: 'Hidup' | 'Almarhum';
  origin?: string;
  notes?: string;
}

export interface FamilyQuadrant {
  name: string;
  color: string;
}

export interface FamilyTreeData {
  quadrants: {
    Q1: FamilyQuadrant;
    Q2: FamilyQuadrant;
    Q3: FamilyQuadrant;
    Q4: FamilyQuadrant;
  };
  nodes: FamilyNode[];
}

export const INITIAL_FAMILY_TREE_DATA: FamilyTreeData = {
  quadrants: {
    Q1: { name: "Trah Ayah User (Kuningan)", color: "#0284c7" },
    Q2: { name: "Trah Ibu User (Bogor)", color: "#059669" },
    Q3: { name: "Trah Ayah Pasangan", color: "#e11d48" },
    Q4: { name: "Trah Ibu Pasangan", color: "#9333ea" }
  },
  nodes: [
    // ==========================================
    // TRAH AYAH USER (Q1)
    // ==========================================
    // Gen -3: Uyut
    {
      id: "uyut_1",
      name: "Uyut Utama (Kyai Abdul Ghani)",
      gen: -3,
      order: "Pusat Trah (Uyut)",
      quadrant: "Q1",
      claimed: true,
      gender: "L",
      role: "Uyut Utama (Moyang)",
      birthYear: "1910",
      deathYear: "1982",
      status: "Almarhum",
      origin: "Cianjur"
    },

    // Gen -2: Kakek 1, 2, 3
    {
      id: "kakek_1",
      name: "Kakek 1 (A)",
      gen: -2,
      order: "Anak ke-1",
      quadrant: "Q1",
      claimed: true,
      gender: "L",
      role: "Kakek Sulung",
      parentId: "uyut_1",
      birthYear: "1935",
      deathYear: "2008",
      status: "Almarhum",
      origin: "Bandung"
    },
    {
      id: "kakek_2",
      name: "Kakek 2 (B - Poros)",
      gen: -2,
      order: "Anak ke-2",
      quadrant: "Q1",
      claimed: true,
      gender: "L",
      role: "Kakek Utama (Poros Ayah)",
      parentId: "uyut_1",
      birthYear: "1938",
      deathYear: "2012",
      status: "Almarhum",
      origin: "Bandung"
    },
    {
      id: "kakek_3",
      name: "Kakek 3 (C)",
      gen: -2,
      order: "Anak ke-3",
      quadrant: "Q1",
      claimed: true,
      gender: "L",
      role: "Kakek Bungsu",
      parentId: "uyut_1",
      birthYear: "1942",
      deathYear: "2015",
      status: "Almarhum",
      origin: "Garut"
    },

    // Gen -1: 10 Anak dari Kakek No. 2 (Ayah, Paman, Bibi)
    { id: "ayah_1", name: "Uwa No. 1", gen: -1, order: "Anak ke-1", quadrant: "Q1", claimed: true, gender: "L", role: "Uwa Pertama", parentId: "kakek_2", birthYear: "1963", status: "Hidup", origin: "Bandung" },
    { id: "ayah_2", name: "Ayah No. 2 (Karta)", gen: -1, order: "Anak ke-2", quadrant: "Q1", claimed: true, gender: "L", role: "Ayah Kandung User", parentId: "kakek_2", birthYear: "1965", status: "Hidup", origin: "Bandung" },
    { id: "ayah_3", name: "Paman No. 3", gen: -1, order: "Anak ke-3", quadrant: "Q1", claimed: true, gender: "L", role: "Paman", parentId: "kakek_2", birthYear: "1968", status: "Hidup", origin: "Jakarta" },
    { id: "ayah_4", name: "Bibi No. 4", gen: -1, order: "Anak ke-4", quadrant: "Q1", claimed: true, gender: "P", role: "Bibi", parentId: "kakek_2", birthYear: "1970", status: "Hidup", origin: "Bandung" },
    { id: "ayah_5", name: "Paman No. 5", gen: -1, order: "Anak ke-5", quadrant: "Q1", claimed: false, gender: "L", role: "Paman", parentId: "kakek_2", birthYear: "1973", status: "Hidup", origin: "Bogor" },
    { id: "ayah_6", name: "Bibi No. 6", gen: -1, order: "Anak ke-6", quadrant: "Q1", claimed: false, gender: "P", role: "Bibi", parentId: "kakek_2", birthYear: "1975", status: "Hidup", origin: "Bekasi" },
    { id: "ayah_7", name: "Paman No. 7", gen: -1, order: "Anak ke-7", quadrant: "Q1", claimed: false, gender: "L", role: "Paman", parentId: "kakek_2", birthYear: "1978", status: "Hidup", origin: "Bandung" },
    { id: "ayah_8", name: "Bibi No. 8", gen: -1, order: "Anak ke-8", quadrant: "Q1", claimed: false, gender: "P", role: "Bibi", parentId: "kakek_2", birthYear: "1980", status: "Hidup", origin: "Tangerang" },
    { id: "ayah_9", name: "Paman No. 9", gen: -1, order: "Anak ke-9", quadrant: "Q1", claimed: false, gender: "L", role: "Paman", parentId: "kakek_2", birthYear: "1983", status: "Hidup", origin: "Depok" },
    { id: "ayah_10", name: "Bibi No. 10", gen: -1, order: "Anak ke-10", quadrant: "Q1", claimed: false, gender: "P", role: "Bibi Bungsu", parentId: "kakek_2", birthYear: "1986", status: "Hidup", origin: "Bandung" },

    // Gen 0: 6 Anak dari Ayah No. 2 (User & Saudara)
    { id: "user_sib_1", name: "Kakak No. 1", gen: 0, order: "Anak ke-1", quadrant: "Q1", claimed: true, gender: "L", role: "Kakak Sulung", relationType: "kakak", parentId: "ayah_2", birthYear: "1988", status: "Hidup", origin: "Bandung" },
    { id: "user_sib_2", name: "Kakak No. 2", gen: 0, order: "Anak ke-2", quadrant: "Q1", claimed: true, gender: "P", role: "Kakak Kedua", relationType: "kakak", parentId: "ayah_2", birthYear: "1990", status: "Hidup", origin: "Bandung" },
    {
      id: "user_node",
      name: "Hendriana (User No. 3)",
      gen: 0,
      order: "Anak ke-3",
      quadrant: "Q1",
      claimed: true,
      gender: "L",
      role: "User (Kepala Keluarga)",
      isUser: true,
      relationType: "user",
      parentId: "ayah_2",
      spouseName: "Siti Nurhaliza",
      spouseGender: "P",
      birthYear: "1992",
      status: "Hidup",
      origin: "Bandung"
    },
    { id: "user_sib_4", name: "Adik No. 4", gen: 0, order: "Anak ke-4", quadrant: "Q1", claimed: true, gender: "L", role: "Adik Pertama", relationType: "adik", parentId: "ayah_2", birthYear: "1995", status: "Hidup", origin: "Bandung" },
    { id: "user_sib_5", name: "Adik No. 5", gen: 0, order: "Anak ke-5", quadrant: "Q1", claimed: false, gender: "P", role: "Adik Kedua", relationType: "adik", parentId: "ayah_2", birthYear: "1998", status: "Hidup", origin: "Bandung" },
    { id: "user_sib_6", name: "Adik No. 6", gen: 0, order: "Anak ke-6", quadrant: "Q1", claimed: false, gender: "L", role: "Adik Bungsu", relationType: "adik", parentId: "ayah_2", birthYear: "2001", status: "Hidup", origin: "Bandung" },

    // Gen 1: 3 Anak dari User No. 3
    { id: "anak_1", name: "Anak No. 1 (Sulung)", gen: 1, order: "Anak ke-1", quadrant: "Q1", claimed: true, gender: "L", role: "Anak Pertama", parentId: "user_node", birthYear: "2018", status: "Hidup", origin: "Bandung" },
    { id: "anak_2", name: "Anak No. 2 (Tengah)", gen: 1, order: "Anak ke-2", quadrant: "Q1", claimed: true, gender: "P", role: "Anak Kedua", parentId: "user_node", birthYear: "2021", status: "Hidup", origin: "Bandung" },
    { id: "anak_3", name: "Anak No. 3 (Bungsu)", gen: 1, order: "Anak ke-3", quadrant: "Q1", claimed: true, gender: "L", role: "Anak Bungsu", parentId: "user_node", birthYear: "2024", status: "Hidup", origin: "Bandung" },

    // ==========================================
    // TRAH IBU USER (Q2)
    // ==========================================
    { id: "q2_uyut", name: "Uyut Maternal", gen: -3, order: "Uyut", quadrant: "Q2", claimed: true, gender: "L", role: "Uyut Jalur Ibu", birthYear: "1915", deathYear: "1988", status: "Almarhum", origin: "Bogor" },
    { id: "q2_kakek", name: "Kakek Maternal", gen: -2, order: "Anak ke-1", quadrant: "Q2", claimed: true, gender: "L", role: "Kakek (Abah Ibu)", parentId: "q2_uyut", birthYear: "1940", deathYear: "2016", status: "Almarhum", origin: "Bogor" },
    { id: "q2_ibu", name: "Ibu Kandung User", gen: -1, order: "Anak ke-1", quadrant: "Q2", claimed: true, gender: "P", role: "Ibu Kandung", parentId: "q2_kakek", birthYear: "1968", status: "Hidup", origin: "Bogor" },
    { id: "q2_user", name: "Hendriana (Trah Ibu)", gen: 0, order: "Anak ke-1", quadrant: "Q2", claimed: true, gender: "L", role: "User (Trah Ibu)", parentId: "q2_ibu", birthYear: "1992", status: "Hidup", origin: "Bandung" },

    // ==========================================
    // TRAH AYAH PASANGAN (Q3)
    // ==========================================
    { id: "q3_uyut", name: "Uyut Besan Ayah", gen: -3, order: "Uyut Besan", quadrant: "Q3", claimed: true, gender: "L", role: "Uyut Besan", birthYear: "1912", deathYear: "1985", status: "Almarhum", origin: "Bogor" },
    { id: "q3_kakek", name: "Kakek Mertua", gen: -2, order: "Anak ke-1", quadrant: "Q3", claimed: false, gender: "L", role: "Kakek Mertua", parentId: "q3_uyut", birthYear: "1936", deathYear: "2010", status: "Almarhum", origin: "Bogor" },
    { id: "q3_ayah_mertua", name: "Ayah Mertua (H. Suryana)", gen: -1, order: "Anak ke-1", quadrant: "Q3", claimed: true, gender: "L", role: "Ayah Pasangan", parentId: "q3_kakek", birthYear: "1962", status: "Hidup", origin: "Bogor" },
    { id: "q3_pasangan", name: "Siti Nurhaliza (Trah Ayah)", gen: 0, order: "Anak ke-1", quadrant: "Q3", claimed: true, gender: "P", role: "Pasangan", parentId: "q3_ayah_mertua", birthYear: "1994", status: "Hidup", origin: "Bogor" },

    // ==========================================
    // TRAH IBU PASANGAN (Q4)
    // ==========================================
    { id: "q4_uyut", name: "Uyut Besan Ibu", gen: -3, order: "Uyut Besan", quadrant: "Q4", claimed: true, gender: "P", role: "Uyut Besan", birthYear: "1916", deathYear: "1989", status: "Almarhum", origin: "Bogor" },
    { id: "q4_kakek", name: "Nenek Mertua", gen: -2, order: "Anak ke-1", quadrant: "Q4", claimed: false, gender: "P", role: "Nenek Mertua", parentId: "q4_uyut", birthYear: "1939", deathYear: "2011", status: "Almarhum", origin: "Bogor" },
    { id: "q4_ibu_mertua", name: "Ibu Mertua (Hj. Maryam)", gen: -1, order: "Anak ke-1", quadrant: "Q4", claimed: true, gender: "P", role: "Ibu Pasangan", parentId: "q4_kakek", birthYear: "1965", status: "Hidup", origin: "Bogor" },
    { id: "q4_pasangan", name: "Siti Nurhaliza (Trah Ibu)", gen: 0, order: "Anak ke-1", quadrant: "Q4", claimed: true, gender: "P", role: "Pasangan", parentId: "q4_ibu_mertua", birthYear: "1994", status: "Hidup", origin: "Bogor" }
  ]
};
