import React from 'react';
import styles from './RenderList.module.css'

export default function RenderList({ items, setItem, type }) {
  return (
    <ul className={styles['side-list']}>
      {items.map((item) => (
        <li key={item.project_id} className={styles['list-item-container']}>
          {hRenderList(item, setItem, type)}
        </li>
      ))}
    </ul>
  );
}

function hRenderList(item, setItem, type) {
  if (type === "project") {
    return <RenderProjectListItem item={item} setItems={setItem} />
  } else if (type === "event") {
    return <RenderEventListItem item={item} setItems={setItem} />
  } else if (type == "message") {
    return <RenderMessageListItem item={item} setItems={setItem} />
  }
  throw new Error('incorrect type specified');
}

function RenderProjectListItem({ item, setItems }) {
  return (
    <div>
      <div className={styles['toggle-container']}>
        <RenderToggleBtn item={item} setItems={setItems} />
        <span className={styles["item-name"]}>{item.projectName}</span>
      </div>
      <div className={`${styles['toggled-container']} ${item.isOpen ? styles['line_on'] : styles['line_off']}`}>
        <div className={styles['toggled-container-content']}>
          From {item.startDate} until {item.endDate}
          {item.isOpen && (
            <div className={styles["additional-info"]}>
              {item.description}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function RenderEventListItem({ item, setItems }) {
  return (
    <div>
      <div className={styles['toggle-container']}>
        <RenderToggleBtn item={item} setItems={setItems} />
        <span className={styles["item-name"]}>{item.name}</span>
      </div>
      <div className={`${styles['toggled-container']} ${item.isOpen ? styles['line_on'] : styles['line_off']}`}>
        <div className={styles['toggled-container-content']}>
          Associated with: {item.project_id}<br /> {/* Get Associated project */}
          Category: {item.interestType}<br />
          Date & Time: {item.startDateTime}<br />
          {item.isOpen && (
            <div className={styles["additional-info"]}>
              Duration: {item.duration} {item.duration == 1 ? "Hour" : "Hours"}<br />
              Price: {item.price}<br />
              Where: {item.locationName} ({item.address})<br />
              Avaliability: {item.booked ?? 0} / {item.capacity}<br />

              Description: {item.description}<br />
              Hosted By: {item.creator}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



function RenderToggleBtn({ item, setItems }) {
  const toggleItem = (itemId, setItems) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, isOpen: !item.isOpen } : item
      )
    );
  };

  return (
    <div className={`${styles['toggle-button']} ${item.isOpen ? styles['filled'] : styles['unfilled']}`} onClick={() => toggleItem(item.id, setItems)}>
      <div className={styles["circle"]}></div>
    </div>
  )
}



function RenderMessageListItem({ item, setItems }) {
  return (
    <div>
      <p1>{item.sender} : {item.message}</p1>
    </div>
  )
}