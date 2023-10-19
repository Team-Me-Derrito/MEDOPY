import React from 'react';
import styles from './RenderList.module.css'
import { BLACK_LIST } from '@/public/constants/BlackList';

/**
 * Component to render a list of items in a selected format based on type
 * @param {*} param0 
 * @returns 
 */
export default function RenderList({ items, setItem, type }) {
  if (items == null) {
    return <div>loading</div>
  }
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

/**
 * Helper function to select which format an item is being rendered in
 * @param {} item 
 * @param {*} setItem 
 * @param {*} type 
 * @returns HTML of item rendered in selected format
 */
function hRenderList(item, setItem, type) {
  if (type === "project") {
    return <RenderProjectListItem item={item} setItems={setItem} />
  } else if (type === "event") {
    return <RenderEventListItem item={item} setItems={setItem} />
  } else if (type == "message") {
    return <RenderMessageListItem item={item} setItems={setItem} />
  } else if (type == "community_info") {
    return <RenderInterestItem item={item} setItems={setItem} />
  }
  throw new Error('incorrect type specified');
}

/**
 * Format to render project items
 * @param {} param0 
 * @returns 
 */
function RenderProjectListItem({ item, setItems }) {
  const options1 = { year: 'numeric', month: 'long', day: 'numeric' };
  const date1 = new Date(item.project_start);
  const date2 = new Date(item.project_end);

  return (
    <div>
      <div className={styles['toggle-container']}>
        <RenderToggleBtn item={item} setItems={setItems} />
        <span className={styles["item-name"]}>{item.project_name}</span>
      </div>
      <div className={`${styles['toggled-container']} ${item.isOpen ? styles['line_on'] : styles['line_off']}`}>
        <div className={styles['toggled-container-content']}>
          From: <b>{date1.toLocaleString('en-US', options1)}</b> <br />
          Until: <b>{date2.toLocaleString('en-US', options1)}</b>
          {item.isOpen && (
            <div className={styles["additional-info1"]}>
              <b>Description:</b>
              <div className={styles["additional-info"]}>
                {item.project_description}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Formant to render event items
 * @param {} param0 
 * @returns 
 */
function RenderEventListItem({ item, setItems }) {
  const date = new Date(item.start_date_time);
  const options1 = { year: 'numeric', month: 'long', day: 'numeric' };
  const options2 = { hour: '2-digit', minute: '2-digit' };
  return (
    <div>
      <div className={styles['toggle-container']}>
        <RenderToggleBtn item={item} setItems={setItems} />
        <span className={styles["item-name"]}>{item.name}</span>
      </div>
      <div className={`${styles['toggled-container']} ${item.isOpen ? styles['line_on'] : styles['line_off']}`}>
        <div className={styles['toggled-container-content']}>
          Project:<b> {item.project}</b><br /> {/* Get Associated project */}
          {/* Category: {item.interestType}<br /> */}
          Date: <b>{date.toLocaleString('en-US', options1)}</b><br />
          Where: <b>{item.venue_name} </b><br />
          {item.isOpen && (
            <div className={styles["additional-info1"]}>
              <b>More Details:</b>
              <div className={styles["additional-info"]}>
                Time: {date.toLocaleString('en-US', options2)}<br />
                Duration: {item.duration} {item.duration == 1 ? "Hour" : "Hours"}<br />
                Avaliability: {item.attendance} / {item.capacity}<br />
                Hosted By: {item.creator_name}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

/**
 * Toggle button component used in project and event items
 * @param {} param0 
 * @returns 
 */
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

/**
 * Format to render message items
 * @param {*} param0 
 * @returns 
 */
function RenderMessageListItem({ item, setItems }) {
  const date = new Date(item.post_timestamp);
  const options2 = { hour: '2-digit', minute: '2-digit', hour12: false };
  return (
    <div className={styles["item-name2"]}>
      <p1>{item.poster_account} ({date.toLocaleString('en-US', options2)}): {filter(item.post)}</p1>
    </div>
  )
}

/**
 * Function to filter a post through a blacklist
 * @param message the post to be filtered
 * @returns either the message if no words black listed or a censored version of the message
 */
function filter(message) {
  for (var i = 0; i < BLACK_LIST.length; i++) {
    if (message.toLowerCase().includes(BLACK_LIST[i])) {
      return ("[REDACTED]");
    }
  }
  return message
}

/**
 * Format to render community interest frequencies
 * @param {} param0 
 * @returns 
 */
function RenderInterestItem({ item, setItems }) {
  return (
    <div className={styles["item-name1"]} >
      <p1>{item.interest}: {item.count}</p1>
    </div>
  )
}