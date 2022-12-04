const getInfoFromTarget = (currentTarget: EventTarget & HTMLButtonElement) => {
  const { dataset } = currentTarget;
  const { reportData: data, logId, eventName } = dataset;
  return {
    data: JSON.parse(data || '{}'),
    logId,
    eventName
  }
}

class AutoLogger {

  reportClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    const { data, logId, eventName } = getInfoFromTarget(e.currentTarget); 
    console.log(`上报事件名称: ${eventName}, 上报 Id: ${logId}, 上报数据: ${JSON.stringify(data ||{})}`)
  }

  generateReportClickFn = (fn: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void) => {
    const instance = this;
    return (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      instance.reportClick(e);
      fn(e);
    }
  }
}

export default new AutoLogger();