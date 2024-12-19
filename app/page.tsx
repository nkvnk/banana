"use client";
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

type DataSet = {
  id: number;
  name: string;
  color: { stroke: string; fill: string };
  values: { [key: string]: number };
};

const RadarChartApp = () => {
  const [metrics, setMetrics] = useState<Metric[]>(() => {
    const storedMetrics = localStorage.getItem("metrics");
    return storedMetrics ? JSON.parse(storedMetrics) : [];
  });

  const [dataSets, setDataSets] = useState<DataSet[]>(() => {
    const storedData = localStorage.getItem("dataSets");
    return storedData ? JSON.parse(storedData) : [];
  });

  const [activeDataSetId, setActiveDataSetId] = useState<number | null>(null);
  const [newMetricName, setNewMetricName] = useState<string>("");

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
      name: `？君`,
      color: newColor,
      values: metrics.reduce(
        (acc, metric) => ({ ...acc, [metric.name]: 0 }),
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
          values: { ...ds.values, [newMetricName]: 0 },
        }))
      );
      setNewMetricName("");
    }
  };

  const updateMetricValue = (
    dataSetId: number,
    metricName: string,
    value: string
  ) => {
    setDataSets((prev) =>
      prev.map((ds) =>
        ds.id === dataSetId
          ? {
              ...ds,
              values: { ...ds.values, [metricName]: parseFloat(value) || 0 },
            }
          : ds
      )
    );
  };

  const removeMetric = (metricName: string) => {
    setMetrics((prev) => prev.filter((m) => m.name !== metricName));
    setDataSets((prev) =>
      prev.map((ds) => {
        const { [metricName]: _, ...remainingValues } = ds.values;
        return { ...ds, values: remainingValues };
      })
    );
  };

  const chartData = metrics.map((metric) => ({
    name: metric.name,
    ...dataSets.reduce(
      (acc, ds) => ({
        ...acc,
        [ds.name]: ds.values[metric.name] || 0,
      }),
      {}
    ),
  }));

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>能力評価レーダーチャート</span>
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
                  <div key={metric.name} className="space-y-2">
                    <Label>{metric.name}</Label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={
                        dataSets.find((ds) => ds.id === activeDataSetId)
                          ?.values[metric.name] || ""
                      }
                      onChange={(e) =>
                        updateMetricValue(
                          activeDataSetId!,
                          metric.name,
                          e.target.value
                        )
                      }
                    />
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
