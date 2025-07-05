'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
// import { useToast } from '../ui/toast';
import { 
  RecycledContent, 
  ContentFormat, 
  Platform, 
  PLATFORM_CONFIGS 
} from '../../types/recycling';
import { 
  RefreshCw, 
  Copy, 
  Check, 
  Edit3, 
  Save,
  X,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Mail,
  Quote
} from 'lucide-react';
import { saveCostBreakdown } from '@/lib/costCalculator';

interface ContentRecyclerProps {
  initialContent?: string;
  onContentGenerated?: (content: RecycledContent) => void;
}

const platformIcons = {
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
  facebook: Facebook,
  email: Mail,
  quotes: Quote
};

const platformColors = {
  linkedin: 'bg-blue-600',
  twitter: 'bg-sky-500',
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
  facebook: 'bg-blue-700',
  email: 'bg-gray-600',
  quotes: 'bg-green-600'
};

export default function ContentRecycler({ initialContent = '', onContentGenerated }: ContentRecyclerProps) {
  // const { showToast } = useToast();
  const [content, setContent] = useState(initialContent);
  const [isLoading, setIsLoading] = useState(false);
  const [recycledContent, setRecycledContent] = useState<RecycledContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [editingFormat, setEditingFormat] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [tone, setTone] = useState<'professional' | 'casual' | 'friendly' | 'authoritative'>('professional');
  const [industry, setIndustry] = useState('');

  const handleRecycle = async () => {
    if (!content.trim()) {
      setError('Por favor ingresa contenido para reciclar');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/recycle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          tone,
          industry: industry.trim() || undefined
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error al reciclar contenido');
      }

      setRecycledContent(result.recycledContent);
      onContentGenerated?.(result.recycledContent);

      // Guardar breakdown de costos de reciclaje en el CostTracker
      if (result.costData && result.costData.platformBreakdown) {
        Object.entries(result.costData.platformBreakdown).forEach(([platform, data]) => {
          if (typeof data === 'object' && data !== null && 'tokens' in data && 'cost' in data) {
            const tokens = Number((data as any).tokens);
            const cost = Number((data as any).cost);
            saveCostBreakdown({
              inputTokens: 0,
              outputTokens: tokens,
              inputCost: 0,
              outputCost: cost,
              totalCost: cost,
              model: 'gpt-4o-mini',
              timestamp: new Date(),
            });
          }
        });
      }

      // Mostrar métricas de performance
      if (result.metrics?.processingTime) {
        console.log(`Tiempo de procesamiento: ${result.metrics.processingTime}ms`);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, formatId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(formatId);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (err) {
      console.error('Error copiando al portapapeles:', err);
    }
  };

  const startEditing = (format: ContentFormat) => {
    setEditingFormat(format.id);
    setEditedContent(format.content);
  };

  const saveEdit = (formatId: string) => {
    if (recycledContent) {
      const updatedFormats = recycledContent.formats.map(format => 
        format.id === formatId 
          ? { ...format, content: editedContent, isEdited: true }
          : format
      );
      setRecycledContent({
        ...recycledContent,
        formats: updatedFormats,
        updatedAt: new Date()
      });
    }
    setEditingFormat(null);
    setEditedContent('');
  };

  const cancelEdit = () => {
    setEditingFormat(null);
    setEditedContent('');
  };

  const getCharacterCountColor = (count: number, max: number) => {
    const percentage = (count / max) * 100;
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 75) return 'text-yellow-500';
    return 'text-green-500';
  };

  const renderFormatContent = (format: ContentFormat) => {
    const config = PLATFORM_CONFIGS[format.platform];
    const IconComponent = platformIcons[format.platform];
    // EMAIL: usar metadata estructurada
    if (format.platform === 'email' && format.metadata?.email) {
      const email = format.metadata.email;
      return (
        <div className="bg-white rounded-lg border p-4 space-y-2">
          <div className="font-semibold">Subject: {email.subject}</div>
          <div className="font-semibold">{email.greeting}</div>
          <div className="mb-2">{email.intro}</div>
          <div className="font-semibold">Body:</div>
          <div className="bg-gray-50 p-3 rounded-md">{email.body}</div>
          <div className="mt-2"><span className="font-semibold">CTA:</span> {email.callToAction}</div>
          <div className="mt-2"><span className="font-semibold">Firma:</span> {email.signature}</div>
        </div>
      );
    }
    // Fallback email: mostrar como texto plano
    if (format.platform === 'email') {
      return (
        <div className="bg-white rounded-lg border p-4">
          <pre className="whitespace-pre-wrap text-sm text-gray-900 font-sans">{format.content}</pre>
        </div>
      );
    }
    // QUOTES: usar array de objetos y config.maxCharacters
    if (format.platform === 'quotes' && Array.isArray(format.content) && format.content.length > 0 && typeof format.content[0] === 'object' && 'quote' in format.content[0]) {
      return format.content.map((q: { quote: string, characterCount: number }, idx: number) => (
        <div key={q.quote + '-' + q.characterCount + '-' + idx} className="bg-white rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-full ${platformColors[format.platform]}`}>
                <IconComponent className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold capitalize">{format.platform} (Cita {idx + 1})</h3>
                <p className="text-sm text-gray-500">{config.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${getCharacterCountColor(q.characterCount, config.maxCharacters)}`}>
                {q.characterCount}/{config.maxCharacters}
              </span>
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-md whitespace-pre-wrap">{q.quote}</div>
        </div>
      ));
    }
    // RESTO DE PLATAFORMAS
    return (
      <div key={format.id} className="bg-white rounded-lg border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-full ${platformColors[format.platform]}`}>
              <IconComponent className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold capitalize">{format.platform}</h3>
              <p className="text-sm text-gray-500">{config.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${getCharacterCountColor(format.characterCount, config.maxCharacters)}`}>
              {format.characterCount}/{config.maxCharacters}
            </span>
            {format.isEdited && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Editado
              </span>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <div className="bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
            {format.content}
          </div>
          {format.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {format.hashtags.map((tag, index) => (
                <span key={tag + '-' + index} className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {editingFormat !== format.id && (
              <Button size="sm" variant="outline" onClick={() => startEditing(format)}>
                <Edit3 className="w-4 h-4 mr-1" />
                Editar
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => copyToClipboard(format.content, format.id)}
            >
              {copiedFormat === format.id ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copiar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Normaliza fechas si vienen como string
  const normalizeRecycledContent = (content: RecycledContent | null): RecycledContent | null => {
    if (!content) return null;
    return {
      ...content,
      createdAt: typeof content.createdAt === 'string' ? new Date(content.createdAt) : content.createdAt,
      updatedAt: typeof content.updatedAt === 'string' ? new Date(content.updatedAt) : content.updatedAt,
    };
  };

  const normalizedRecycledContent = normalizeRecycledContent(recycledContent);

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="content">Contenido Original</Label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Pega aquí tu artículo, idea o contenido que quieres reciclar..."
            className="w-full p-4 border rounded-md resize-none"
            rows={6}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tone">Tono</Label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value as any)}
              className="w-full p-3 border rounded-md"
            >
              <option value="professional">Profesional</option>
              <option value="casual">Casual</option>
              <option value="friendly">Amigable</option>
              <option value="authoritative">Autoritativo</option>
            </select>
          </div>
          <div>
            <Label htmlFor="industry">Industria (opcional)</Label>
            <Input
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="ej: tecnología, marketing, salud..."
            />
          </div>
        </div>

        <Button 
          onClick={handleRecycle} 
          disabled={isLoading || !content.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Reciclando Contenido...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reciclar en 6 Formatos
            </>
          )}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Section */}
      {normalizedRecycledContent && (() => {
        const costData = (normalizedRecycledContent as any).costData;
        return (
          <div className="space-y-4">
            {/* Mostrar costo de reciclaje si está disponible */}
            {costData && typeof costData === 'object' && typeof costData.totalCost === 'number' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <span className="font-semibold">Costo de reciclaje:</span> ${costData.totalCost.toFixed(4)} USD
                  <span className="ml-4 font-semibold">Tokens usados:</span> {costData.totalTokens}
                </div>
                {costData.platformBreakdown && typeof costData.platformBreakdown === 'object' && (
                  <div className="mt-2 md:mt-0 text-xs text-gray-600">
                    {Object.entries(costData.platformBreakdown).map(([platform, data]) => (
                      typeof data === 'object' && data !== null && 'tokens' in data && 'cost' in data ? (
                        <span key={platform} className="mr-4">
                          {platform}: {(data as any).tokens} tokens (${(data as any).cost.toFixed(5)})
                        </span>
                      ) : null
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Contenido Reciclado</h2>
              <span className="text-sm text-gray-500">
                Generado el {normalizedRecycledContent.createdAt.toLocaleDateString()}
              </span>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="all">Todos</TabsTrigger>
                {Object.keys(PLATFORM_CONFIGS).map((platform) => (
                  <TabsTrigger key={platform} value={platform} className="capitalize">
                    {platform}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {normalizedRecycledContent.formats.map((format, idx) => (
                    <React.Fragment key={format.id || idx}>
                      {renderFormatContent(format)}
                    </React.Fragment>
                  ))}
                </div>
              </TabsContent>

              {Object.keys(PLATFORM_CONFIGS).map((platform) => (
                <TabsContent key={platform} value={platform}>
                  <div className="space-y-4">
                    {normalizedRecycledContent.formats
                      .filter(format => format.platform === platform)
                      .map((format, idx) => (
                        <React.Fragment key={format.id || idx}>
                          {renderFormatContent(format)}
                        </React.Fragment>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        );
      })()}
    </div>
  );
} 