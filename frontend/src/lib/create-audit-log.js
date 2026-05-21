import { auth, currentUser } from "@clerk/nextjs";
import { db } from "@/lib/db";
;
const createAuditLog = async (props) => {
  try {
    const { orgId } = auth();
    const user = await currentUser();
    if (!user || !orgId) {
      throw new Error("User not found!");
    }
    const { entityId, entityType, entityTitle, action } = props;
    await db.auditLog.create({
      data: {
        orgId,
        entityId,
        entityType,
        entityTitle,
        action,
        userId: user.id,
        userImage: user?.imageUrl,
        userName: user?.firstName + " " + user?.lastName
      }
    });
  } catch (error) {
    console.log("[AUDIT_LOG_ERROR]", error);
  }
};
export {
  createAuditLog
};
