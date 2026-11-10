import { DATA_PULLED_ON, MINOR_LIST_ASKED_ON, REPORT_CONTACT_URL } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-10 border-t bg-card">
      <div className="mx-auto max-w-7xl space-y-2 px-4 py-6 text-xs text-muted-foreground">
        <p>
          ข้อมูลรายวิชา (รหัส ชื่อ หน่วยกิต เงื่อนไขรายวิชา) มาจากระบบ CU Get Reg ดึงข้อมูลเมื่อวันที่ {DATA_PULLED_ON}
          ข้อมูลอาจไม่ครบหรือเปลี่ยนแปลงภายหลัง กลุ่มเรียน ตาราง และที่นั่งว่างให้ดูที่ CU Get Reg
        </p>
        <p>
          รายการวิชาโทนอกคณะได้จากการสอบถามหน่วยงานโดยตรงโดยสมาชิกกลุ่ม{MINOR_LIST_ASKED_ON ? ` เมื่อ ${MINOR_LIST_ASKED_ON}` : ""}
          ไม่ใช่ประกาศทางการ โปรดยืนยันกับภาควิชาก่อนลงทะเบียน
        </p>
        <p>
          เว็บนี้เป็นโครงงานของนิสิต ไม่ใช่เว็บไซต์ทางการของจุฬาลงกรณ์มหาวิทยาลัย คณะพาณิชยศาสตร์และการบัญชี หรือ CU Get Reg
          โปรดตรวจสอบกับประกาศทางการก่อนตัดสินใจลงทะเบียนเสมอ
        </p>
        {REPORT_CONTACT_URL && (
          <p>
            พบข้อมูลผิด หรือเป็นเจ้าของข้อมูลและต้องการให้นำออก{" "}
            <a href={REPORT_CONTACT_URL} className="text-primary underline" target="_blank" rel="noopener noreferrer">
              แจ้งทีมงานที่นี่
            </a>
          </p>
        )}
      </div>
    </footer>
  );
}
export default Footer;
