"use client";

import { Calendar, FileText, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Research } from "@/app/types/research";
import { Button } from "../ui/button";
import Link from "next/link";

interface ResearchCardProps {
  research: Research;
}

export const ResearchCard = ({ research }: ResearchCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-2">
          <Link href={`/research/${research.id}`} className="hover:text-primary">
            {research.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-500 line-clamp-2">
          {research.abstract || research.content || "Không có tóm tắt"}
        </p>
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          {research.publishedYear || "N/A"}
        </div>
      </CardContent>
      <div className="p-4">
        <Link href={`/research/${research.id}`}>
          <Button variant="outline" className="w-full flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Xem chi tiết
          </Button>
        </Link>
      </div>
    </Card>
  );
};
