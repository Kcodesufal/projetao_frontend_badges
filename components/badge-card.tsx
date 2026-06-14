import React, { useState } from 'react';
import { Award, Shield, Star, Zap, UserCheck, MessageCircle, Layout, BookOpen, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

export default function BadgeCard({ badge }) {
  const [expanded, setExpanded] = useState(false);

  // Mapeamento de ícones por tipo de badge
  const iconMap = {
    'Liderança': <Shield className="w-8 h-8" />,
    'Trabalho em Equipe': <UserCheck className="w-8 h-8" />,
    'Comunicação': <MessageCircle className="w-8 h-8" />,
    'Organização': <Layout className="w-8 h-8" />,
    'Proatividade': <Zap className="w-8 h-8" />,
    'Impacto Social': <Star className="w-8 h-8" />,
    'Ensino e Capacitação': <BookOpen className="w-8 h-8" />,
    'Inovação': <Lightbulb className="w-8 h-8" />
  };

  const Icon = iconMap[badge.tipo] || <Award className="w-8 h-8" />;

  // Cores dinâmicas baseadas no nível (Nível I, II, III simulando Bronze, Prata, Ouro)
  const levelStyles = {
    'I': 'bg-orange-50 text-orange-700 border-orange-200',
    'II': 'bg-gray-100 text-gray-700 border-gray-300',
    'III': 'bg-yellow-50 text-yellow-700 border-yellow-300',
  };
  const bgStyle = levelStyles[badge.nivel] || levelStyles['I'];

  return (
    <div className={`border rounded-2xl shadow-sm overflow-hidden transition-all duration-300 ${bgStyle}`}>
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-white rounded-full shadow-sm">
            {Icon}
          </div>
          <div>
            <h4 className="font-bold text-sm">{badge.tipo}</h4>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
              Nível {badge.nivel}
            </span>
          </div>
        </div>
        <button className="p-2 hover:bg-black/5 rounded-full transition">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {expanded && (
        <div className="p-4 bg-white border-t border-black/5 text-sm space-y-3">
          <p className="text-gray-700"><strong>Descrição:</strong> {badge.descricao}</p>
          <p className="text-gray-700"><strong>Justificativa:</strong> {badge.justificativa}</p>
          <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
            <span><strong>Emissor:</strong> {badge.emissor_nome} ({badge.emissor_tipo})</span>
            <span><strong>Data:</strong> {new Date(badge.data_emissao).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
