'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { fetchActiveAgreementTemplate, updateAgreementTemplate } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, ArrowUp, ArrowDown, Save, Loader2 } from 'lucide-react';

export default function AgreementTemplatePage() {
    const { toast } = useToast();
    const [template, setTemplate] = useState<any>(null);
    const [introText, setIntroText] = useState('');
    const [terms, setTerms] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadTemplate();
    }, []);

    const loadTemplate = async () => {
        setIsLoading(true);
        try {
            const data = await fetchActiveAgreementTemplate();
            setTemplate(data);
            setIntroText(data.introText);
            setTerms(data.terms || []);
        } catch (error) {
            console.error('Failed to load template', error);
            toast({
                title: "Error",
                description: "Failed to load agreement template",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddTerm = () => {
        setTerms([...terms, '']);
    };

    const handleRemoveTerm = (index: number) => {
        const newTerms = [...terms];
        newTerms.splice(index, 1);
        setTerms(newTerms);
    };

    const handleTermChange = (index: number, value: string) => {
        const newTerms = [...terms];
        newTerms[index] = value;
        setTerms(newTerms);
    };

    const moveTerm = (index: number, direction: 'up' | 'down') => {
        const newTerms = [...terms];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < terms.length) {
            [newTerms[index], newTerms[newIndex]] = [newTerms[newIndex], newTerms[index]];
            setTerms(newTerms);
        }
    };

    const handleSave = async () => {
        if (!template) return;
        setIsSaving(true);
        try {
            await updateAgreementTemplate(template.id, {
                introText,
                terms,
                name: template.name
            });
            toast({
                title: "Success",
                description: "Agreement template updated successfully"
            });
        } catch (error) {
            console.error('Failed to save template', error);
            toast({
                title: "Error",
                description: "Failed to save agreement template",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Agreement Template</h1>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Intro Text</CardTitle>
                    <CardDescription>
                        The paragraph before the terms. Use placeholders like <code>{'{date}'}</code>, <code>{'{party1}'}</code>, and <code>{'{party2}'}</code>.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={introText}
                        onChange={(e) => setIntroText(e.target.value)}
                        placeholder="Enter intro paragraph..."
                        className="min-h-[100px] leading-relaxed"
                    />
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-xl font-semibold">Terms & Conditions</h2>
                    <Button variant="outline" size="sm" onClick={handleAddTerm}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Term
                    </Button>
                </div>

                <div className="space-y-3">
                    {terms.map((term, index) => (
                        <Card key={index} className="relative group">
                            <CardContent className="p-4 flex gap-4 items-start">
                                <div className="font-bold text-muted-foreground pt-2 min-w-[2rem]">
                                    {index + 1}.
                                </div>
                                <Textarea
                                    value={term}
                                    onChange={(e) => handleTermChange(index, e.target.value)}
                                    placeholder={`Term ${index + 1} content...`}
                                    className="resize-none min-h-[60px]"
                                />
                                <div className="flex flex-col gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={index === 0}
                                        onClick={() => moveTerm(index, 'up')}
                                    >
                                        <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={index === terms.length - 1}
                                        onClick={() => moveTerm(index, 'down')}
                                    >
                                        <ArrowDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleRemoveTerm(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {terms.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg bg-muted/50">
                        <p className="text-muted-foreground">No terms added yet. Click "Add Term" to start.</p>
                    </div>
                )}
            </div>

            <div className="flex justify-end pt-4">
                <Button size="lg" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                    Save Template
                </Button>
            </div>
        </div>
    );
}
