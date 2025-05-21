// src/App.js
import React, {
  useEffect,
  useState,
  useRef,
  useReducer,
  useCallback,
} from "react";
import styles from "./app.module.less"; // 组件级样式（可选）
import { MovieData } from "./mdata";
import { VideoCoreSDK, MovieEncoding, loadFFmpeg } from "./videoCoreSDK.es.min";
import {
  Space,
  Progress,
  Toast,
  Slider,
  Button,
  TextArea,
} from "@douyinfe/semi-ui";

console.log("MovieData", MovieData);

function App() {
  const vc = useRef(null);
  const core = useRef(null);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [time, setTime] = useState(0);
  const [totalTime, setTotalTime] = useState(null);
  const me = useRef();
  const [progress, setProgress] = useState({
    sourceLoad: 0,
    encoderAudio: 0,
    encoderVideo: 0,
    totalTime: 0,
  });

  const createVideoCore = useCallback(async () => {
    // const { VideoCoreSDK } = window.VideoCoreSDK;
    let videoTotalTime = null;
    vc.current = new VideoCoreSDK({
      target: document.getElementById("videoBox"),
      data: MovieData, // 必填，工程数据
      movieId: "movieID", // 实例内部唯一标识，多个实例不能相同
      env: "editor", // 必填，渲染模式：editor（编辑模式，可拖动编辑）； preview（预览模式，只能预览，内存消耗更小）
      registerId: "test", // 必填，注册ID，和域名进行绑定的
      EModuleEffectSourcePath: "https://cdn.h5ds.com/assets/effectcanvas/", // 特效资源模块加载路径
      resourceHost: "https://cdn.h5ds.com",
      workerPath: "assets", // 选填，decode.worker.js的引用目录，默认是assets
      useRecordManager: true,
      scale: 0.4, // 选填，画布缩放比例，默认是1
      currentTime: 0, // 选填，默认开始时间是0
      plugins: [], // 选填，扩展插件
      onSourceProgress: (v) => {
        console.warn("onSourceProgress", v);
      },
      triggerCurrentTime: (v) => {
        if (videoTotalTime === null) {
          videoTotalTime = core.current.getTotalTime().toFixed(1);
        }
        setTime(v);
        if (v.toFixed(1) === videoTotalTime) {
          core.current.pause();
          core.current.playing = false;
          return;
        }
      },
      callback: (c) => {
        setTotalTime(c.getTotalTime(MovieData));
      },
    });
    core.current = await vc.current.init();
  }, []);

  useEffect(() => {
    createVideoCore();

    return () => {
      if (core.current) {
        core.current.destroy();
        vc.current.destroy();
      }
    };
  }, []);

  const textElement = MovieData.elements.find((d) => d.type === "text");

  return (
    <div>
      <h1>Hello 欢迎使用无界云剪内核：video-core</h1>
      <p>
        此内核仅供学习使用，如需商用，请先获取官方授权，
        <a
          style={{ color: "red" }}
          target="_blank"
          href="https://video.h5ds.com/docs/sdk/core.html"
        >
          技术文档
        </a>
      </p>
      <div className={styles.container}>
        <div className={styles.view}>
          <div
            id="videoBox"
            style={{
              display: "inline-block",
              position: "relative",
              overflow: "hidden",
            }}
          ></div>
        </div>
        <div className={styles.options}>
          <div>
            <Space>
              <Button
                onClick={() => {
                  core.current.play();
                }}
              >
                play
              </Button>
              <Button
                onClick={() => {
                  core.current.pause();
                }}
              >
                pause
              </Button>
              <Button
                onClick={async () => {
                  await loadFFmpeg();
                  const values = {
                    resolution: "720P",
                    fps: 30,
                  };
                  console.log(values);
                  if (me.current) {
                    me.current.destroy();
                    me.current = null;
                  }
                  me.current = new MovieEncoding({
                    gifWorkerPath: "/assets/worker/gif.worker.js",
                    workerPath: "/assets/worker/decode.worker.js",
                    format: "mp4",
                    ...values,
                    EModuleEffectSourcePath:
                      "https://cdn.h5ds.com/assets/effectcanvas/", // 特效资源模块加载路径
                    resourceHost: "https://cdn.h5ds.com",
                    movieData: MovieData,
                    onReady: async () => {
                      await me.current.run();
                    },
                    onProgress: (v) => {
                      progress[v.type] = v.progress;
                      setProgress({ ...progress });
                    },
                    onFinish: (videoAndAudioRemixURL) => {
                      console.log("finish");
                      Toast.success("合成成功！");
                      window.URL.revokeObjectURL(videoAndAudioRemixURL);
                    },
                  });
                }}
              >
                导出视频
              </Button>
            </Space>
          </div>
          <div>
            {totalTime !== null && (
              <Slider
                step={0.1}
                max={totalTime}
                value={time}
                onChange={(v) => {
                  setTime(v);
                  core.current.step(v);
                }}
              />
            )}
          </div>
          <div>
            {["sourceLoad", "encoderAudio", "encoderVideo"].map((name) => {
              return (
                <div key={name} className={styles.infos}>
                  <span className={styles.name}>{name}</span>
                  <Progress
                    percent={~~(progress[name] * 100)}
                    style={{ height: "4px", width: "100%" }}
                  />
                  <span>{~~(progress[name] * 100)}%</span>
                </div>
              );
            })}
          </div>
          <div className={styles.text}>
            <h5>修改文本内容</h5>
            <TextArea
              maxCount={100}
              value={textElement.text}
              onChange={(v) => {
                textElement.text = v;
                core.current.update();
                forceUpdate();
              }}
            ></TextArea>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
