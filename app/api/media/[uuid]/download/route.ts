import { auth } from "@/auth";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const session = await auth();

  if (!session?.user?.accessToken) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { uuid } = await params;

  try {
    const response = await axios.get(
      `${process.env.API_URL}media/${uuid}/download`,
      {
        headers: { Authorization: `Bearer ${session.user.accessToken}` },
        responseType: "arraybuffer",
      }
    );

    const contentDisposition =
      response.headers["content-disposition"] ??
      `attachment; filename="download"`;
    const contentType =
      response.headers["content-type"] ?? "application/octet-stream";

    return new NextResponse(response.data, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      return new NextResponse("Error al descargar el archivo", { status });
    }
    return new NextResponse("Error interno", { status: 500 });
  }
}
