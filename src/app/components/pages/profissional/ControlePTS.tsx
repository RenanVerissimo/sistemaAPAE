import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { ChevronRight } from "lucide-react";

interface ControlePTSProps {
  onBack?: () => void;
  setSnackbar?: (state: any) => void;
}

export default function ControlePTS({ onBack }: ControlePTSProps) {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Controle PTS</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onBack && onBack()}>
            Voltar
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent>
          <p className="text-sm text-gray-600">
            Nesta tela você irá controlar quais pacientes já realizaram o
            Projeto Terapêutico Singular (PTS). Por enquanto é um placeholder —
            implemente a listagem e filtros conforme necessário.
          </p>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => navigate("/ProfissionalDashboard")}>Fechar</Button>
            <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
