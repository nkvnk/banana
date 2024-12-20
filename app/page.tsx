"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CHART_COLORS = [
  { name: "赤", stroke: "#FF0000", fill: "#FFCCCC" },
  { name: "青", stroke: "#0000FF", fill: "#CCCCFF" },
  { name: "緑", stroke: "#008000", fill: "#B8E6A8" },
  { name: "オレンジ", stroke: "#FFA500", fill: "#FFB84D" },
  { name: "紫", stroke: "#800080", fill: "#E6A8D7" },
  { name: "ピンク", stroke: "#FFC0CB", fill: "#FFCCE5" },
  { name: "茶色", stroke: "#A52A2A", fill: "#D6A69E" },
  { name: "灰色", stroke: "#808080", fill: "#D3D3D3" },
  { name: "黒", stroke: "#000000", fill: "#666666" },
  { name: "水色", stroke: "#00BFFF", fill: "#B2D8FF" },
  { name: "ライトグリーン", stroke: "#32CD32", fill: "#9AF29E" },
  { name: "スカイブルー", stroke: "#87CEEB", fill: "#B3D9F9" },
  { name: "ラベンダー", stroke: "#E6E6FA", fill: "#F2F2FF" },
  { name: "ターコイズ", stroke: "#40E0D0", fill: "#A2F4F1" },
  { name: "サーモン", stroke: "#FA8072", fill: "#FFB7A4" },
  { name: "チャコール", stroke: "#36454F", fill: "#A1A8B3" },
  { name: "ゴールド", stroke: "#FFD700", fill: "#FFE066" },
  { name: "シルバー", stroke: "#C0C0C0", fill: "#D3D3D3" },
];

type Metric = {
  name: string;
};

type MetricValue = {
  value: number;
  comment: string;
};

type DataSet = {
  id: number;
  name: string;
  color: { stroke: string; fill: string };
  values: { [key: string]: MetricValue };
};

const RadarChartApp = () => {
  if (typeof window !== "undefined") {
    // このコードはクライアントサイドでのみ実行されます
    const value = localStorage.getItem("someKey");
  }

  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [dataSets, setDataSets] = useState<DataSet[]>([]);
  const [activeDataSetId, setActiveDataSetId] = useState<number | null>(null);
  const [newMetricName, setNewMetricName] = useState<string>("");

  useEffect(() => {
    const storedMetrics = localStorage.getItem("metrics");
    if (storedMetrics) {
      setMetrics(JSON.parse(storedMetrics));
    }

    const storedDataSets = localStorage.getItem("dataSets");
    if (storedDataSets) {
      setDataSets(JSON.parse(storedDataSets));
    }
  }, []);

  useEffect(() => {
    if (dataSets.length > 0 && activeDataSetId === null) {
      setActiveDataSetId(dataSets[0].id);
    }
  }, [dataSets, activeDataSetId]);

  useEffect(() => {
    localStorage.setItem("metrics", JSON.stringify(metrics));
    localStorage.setItem("dataSets", JSON.stringify(dataSets));
  }, [metrics, dataSets]);

  const addDataSet = () => {
    const newId =
      dataSets.length > 0 ? Math.max(...dataSets.map((ds) => ds.id)) + 1 : 1;
    const newColor = CHART_COLORS[dataSets.length % CHART_COLORS.length];
    const newDataSet: DataSet = {
      id: newId,
      name: `メンバー`,
      color: newColor,
      values: metrics.reduce(
        (acc, metric) => ({
          ...acc,
          [metric.name]: { value: 0, comment: "" },
        }),
        {}
      ),
    };

    setDataSets((prev) => [...prev, newDataSet]);
    setActiveDataSetId(newDataSet.id);
  };

  const removeDataSet = (id: number) => {
    const newDataSets = dataSets.filter((ds) => ds.id !== id);
    setDataSets(newDataSets);
    if (activeDataSetId === id && newDataSets.length > 0) {
      setActiveDataSetId(newDataSets[0].id);
    }
  };

  const updateDataSetName = (id: number, newName: string) => {
    setDataSets((prev) =>
      prev.map((ds) => (ds.id === id ? { ...ds, name: newName } : ds))
    );
  };

  const addMetric = () => {
    if (newMetricName && !metrics.some((m) => m.name === newMetricName)) {
      const newMetric = { name: newMetricName };
      setMetrics((prev) => [...prev, newMetric]);
      setDataSets((prev) =>
        prev.map((ds) => ({
          ...ds,
          values: {
            ...ds.values,
            [newMetricName]: { value: 0, comment: "" },
          },
        }))
      );
      setNewMetricName("");
    }
  };

  const updateMetricValue = (
    dataSetId: number,
    metricName: string,
    value: string,
    isComment: boolean = false
  ) => {
    setDataSets((prev) =>
      prev.map((ds) =>
        ds.id === dataSetId
          ? {
              ...ds,
              values: {
                ...ds.values,
                [metricName]: isComment
                  ? { ...ds.values[metricName], comment: value }
                  : { ...ds.values[metricName], value: parseFloat(value) || 0 },
              },
            }
          : ds
      )
    );
  };

  const removeMetric = (metricName: string) => {
    setMetrics((prev) => prev.filter((m) => m.name !== metricName));
    setDataSets((prev) =>
      prev.map((ds) => {
        const { [metricName]: _removed, ...remainingValues } = ds.values;
        return { ...ds, values: remainingValues };
      })
    );
  };

  const chartData = metrics.map((metric) => ({
    name: metric.name,
    ...dataSets.reduce(
      (acc, ds) => ({
        ...acc,
        [ds.name]: ds.values[metric.name]?.value || 0,
      }),
      {}
    ),
  }));

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>評価レーダーチャート</span>
            <Button onClick={addDataSet} variant="outline">
              メンバーを追加
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid gridType="polygon" />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={30} domain={[0, 10]} />
                {dataSets.map((ds) => (
                  <Radar
                    key={ds.id}
                    name={ds.name}
                    dataKey={ds.name}
                    stroke={ds.color.stroke}
                    fill={ds.color.fill}
                    fillOpacity={0.3}
                  />
                ))}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>評価項目の管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  value={newMetricName}
                  onChange={(e) => setNewMetricName(e.target.value)}
                  placeholder="新しい指標名"
                />
              </div>
              <Button onClick={addMetric}>指標を追加</Button>
            </div>
            {metrics.map((metric) => (
              <div key={metric.name} className="flex items-center space-x-2">
                <div className="font-medium flex-1">{metric.name}</div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeMetric(metric.name)}
                >
                  削除
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>メンバーのデータを編集</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Select
                value={activeDataSetId?.toString() || ""}
                onValueChange={(value) => setActiveDataSetId(parseInt(value))}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="データセットを選択" />
                </SelectTrigger>
                <SelectContent>
                  {dataSets.map((ds) => (
                    <SelectItem key={ds.id} value={ds.id.toString()}>
                      {ds.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {dataSets.length > 1 && activeDataSetId && (
                <Button
                  variant="destructive"
                  onClick={() => removeDataSet(activeDataSetId)}
                >
                  メンバーを削除
                </Button>
              )}
            </div>

            {activeDataSetId && (
              <div className="space-y-4">
                <div>
                  <Label>メンバーの名前</Label>
                  <Input
                    value={
                      dataSets.find((ds) => ds.id === activeDataSetId)?.name ||
                      ""
                    }
                    onChange={(e) =>
                      updateDataSetName(activeDataSetId, e.target.value)
                    }
                    placeholder="名前"
                  />
                </div>

                {metrics.map((metric) => (
                  <div key={metric.name} className="space-y-2 border-b pb-4">
                    <Label>{metric.name}</Label>
                    <div className="grid gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={
                          dataSets.find((ds) => ds.id === activeDataSetId)
                            ?.values[metric.name]?.value || ""
                        }
                        onChange={(e) =>
                          updateMetricValue(
                            activeDataSetId,
                            metric.name,
                            e.target.value
                          )
                        }
                      />
                      <Textarea
                        placeholder={`${metric.name}についてのコメントを入力...`}
                        value={
                          dataSets.find((ds) => ds.id === activeDataSetId)
                            ?.values[metric.name]?.comment || ""
                        }
                        onChange={(e) =>
                          updateMetricValue(
                            activeDataSetId,
                            metric.name,
                            e.target.value,
                            true
                          )
                        }
                        className="min-h-[100px] resize-y"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RadarChartApp;
