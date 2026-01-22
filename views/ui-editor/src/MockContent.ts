import { observe } from 'react-observing';
import { type TComponent, type TElement, type TStyle } from './editor';


export const INITIAL_CONTENT = {
  styles: observe<TStyle[]>([
    { id: observe(crypto.randomUUID()), content: observe('button { padding:8px; padding-left:16px;padding-right:16px; border:none; background-color:green; border-radius:4px; color:white; }') },
    { id: observe(crypto.randomUUID()), content: observe('button:disabled { opacity: 0.5 }') }
  ]),
  components: observe<TComponent[]>([
    { // Custom input
      id: observe('simple-component'),
      content: observe<TElement[]>([
        {
          id: observe(crypto.randomUUID()),
          type: observe('html'),
          tag: observe('input'),
          name: observe('input'),
          customData: { teste: 1 },
          children: observe(undefined),
          attributes: observe([
            { name: observe('placeholder'), value: observe('Type a email here...') },
          ]),
          style: observe([
            { name: observe('padding'), value: observe(8) },
            { name: observe('padding-left'), value: observe(16) },
            { name: observe('padding-right'), value: observe(16) },
            { name: observe('border'), value: observe('thin solid gray') },
            { name: observe('border-radius'), value: observe(50) },
          ]),
        },
      ]),
    },
    { // Component with a slot
      id: observe('component-with-slot'),
      content: observe<TElement[]>([
        {
          id: observe(crypto.randomUUID()),
          type: observe('html'),
          tag: observe('div'),
          name: observe('div'),
          style: observe([
            { name: observe('padding'), value: observe(16) },
          ]),
          attributes: observe([
            { name: observe('hidden'), value: observe(false) },
          ]),
          children: observe<TElement[]>([
            {
              id: observe(crypto.randomUUID()),
              tag: observe('p'),
              name: observe('p'),
              style: observe([]),
              type: observe('html'),
              attributes: observe([]),
              customData: { teste: 4 },
              children: observe([
                {
                  id: observe(crypto.randomUUID()),
                  type: observe('text'),
                  name: observe('text'),
                  customData: { teste: 88 },
                  text: observe('"Slot below:"'),
                }
              ]),
            },
            {
              id: observe('slot-component-with-slot'),
              type: observe('slot'),
              name: observe('Slot1'),
              componentId: observe('component-with-slot'),
            },
          ]),
        },
      ]),
    },
    { // Component with component with slot
      id: observe('component-with-component-with-slot'),
      content: observe<TElement[]>([
        {
          id: observe(crypto.randomUUID()),
          type: observe('html'),
          tag: observe('div'),
          name: observe('div'),
          style: observe([
            { name: observe('padding'), value: observe(16) },
          ]),
          attributes: observe([
            { name: observe('hidden'), value: observe(false) },
          ]),
          children: observe<TElement[]>([
            {
              id: observe(crypto.randomUUID()),
              tag: observe('p'),
              name: observe('p'),
              style: observe([]),
              type: observe('html'),
              customData: { teste: 4 },
              attributes: observe([]),
              children: observe([
                {
                  id: observe(crypto.randomUUID()),
                  type: observe('text'),
                  name: observe('text'),
                  customData: { teste: 88 },
                  text: observe('"Component with slot below:"'),
                }
              ]),
            },
            {
              id: observe(crypto.randomUUID()),
              slots: observe([]),
              type: observe('component'),
              name: observe('Component with slot'),
              referenceComponentId: observe('component-with-slot'),
            },
          ]),
        },
      ]),
    },
    { // Component with component with slot with a child
      id: observe('component-with-component-with-slot-with-child'),
      content: observe<TElement[]>([
        {
          id: observe(crypto.randomUUID()),
          type: observe('html'),
          tag: observe('div'),
          name: observe('div'),
          style: observe([
            { name: observe('padding'), value: observe(16) },
          ]),
          attributes: observe([
            { name: observe('hidden'), value: observe(false) },
          ]),
          children: observe<TElement[]>([
            {
              id: observe(crypto.randomUUID()),
              tag: observe('p'),
              name: observe('p'),
              style: observe([]),
              type: observe('html'),
              attributes: observe([]),
              customData: { teste: 4 },
              children: observe([
                {
                  id: observe(crypto.randomUUID()),
                  type: observe('text'),
                  name: observe('text'),
                  customData: { teste: 88 },
                  text: observe('"Component with slot with children below:"'),
                }
              ]),
            },
            {
              id: observe(crypto.randomUUID()),
              type: observe('component'),
              name: observe('Component with slot'),
              referenceComponentId: observe('component-with-slot'),
              slots: observe<TElement<'slot-content'>[]>([
                {
                  id: observe(crypto.randomUUID()),
                  type: observe('slot-content'),
                  referenceSlotId: observe('slot-component-with-slot'),
                  children: observe([
                    {
                      id: observe(crypto.randomUUID()),
                      tag: observe('p'),
                      name: observe('p'),
                      style: observe([]),
                      type: observe('html'),
                      attributes: observe([]),
                      customData: { teste: 4 },
                      children: observe([
                        {
                          id: observe(crypto.randomUUID()),
                          type: observe('text'),
                          name: observe('text'),
                          customData: { teste: 88 },
                          text: observe('"Child of a component with slot in a component:"'),
                        }
                      ]),
                    },
                  ]),
                }
              ]),
            },
          ]),
        },
      ]),
    },
    { // Loop 1 - Component inside it self
      id: observe('component-with-it-self'),
      content: observe<TElement[]>([
        {
          id: observe(crypto.randomUUID()),
          type: observe('html'),
          tag: observe('div'),
          name: observe('div'),
          style: observe([
            { name: observe('padding'), value: observe(16) },
          ]),
          attributes: observe([
            { name: observe('hidden'), value: observe(false) },
          ]),
          children: observe<TElement[]>([
            {
              id: observe(crypto.randomUUID()),
              tag: observe('p'),
              name: observe('p'),
              style: observe([]),
              type: observe('html'),
              attributes: observe([]),
              children: observe([
                {
                  id: observe(crypto.randomUUID()),
                  type: observe('text'),
                  name: observe('text'),
                  customData: { teste: 88 },
                  text: observe('"It self below:"'),
                }
              ]),
            },
            {
              id: observe(crypto.randomUUID()),
              slots: observe([]),
              type: observe('component'),
              name: observe('Component with it self'),
              referenceComponentId: observe('component-with-it-self'),
            },
          ]),
        },
      ]),
    },
    { // Loop 2 - Component with component inside with this inside
      id: observe('component-with-component-inside-with-this-inside'),
      content: observe<TElement[]>([
        {
          id: observe(crypto.randomUUID()),
          type: observe('html'),
          tag: observe('div'),
          name: observe('div'),
          style: observe([
            { name: observe('padding'), value: observe(16) },
          ]),
          attributes: observe([
            { name: observe('hidden'), value: observe(false) },
          ]),
          children: observe<TElement[]>([
            {
              id: observe(crypto.randomUUID()),
              tag: observe('p'),
              name: observe('p'),
              style: observe([]),
              type: observe('html'),
              attributes: observe([]),
              children: observe([
                {
                  id: observe(crypto.randomUUID()),
                  type: observe('text'),
                  name: observe('text'),
                  customData: { teste: 88 },
                  text: observe('"1 - Other with it self below:"'),
                }
              ]),
            },
            {
              id: observe(crypto.randomUUID()),
              slots: observe([]),
              type: observe('component'),
              name: observe('Component with component with it self'),
              referenceComponentId: observe('component-with-component-inside-with-this-inside-2'),
            },
          ]),
        },
      ]),
    },
    { // Loop 2 - Component with component inside with this inside 2
      id: observe('component-with-component-inside-with-this-inside-2'),
      content: observe<TElement[]>([
        {
          id: observe(crypto.randomUUID()),
          type: observe('html'),
          tag: observe('div'),
          name: observe('div'),
          style: observe([
            { name: observe('padding'), value: observe(16) },
          ]),
          attributes: observe([
            { name: observe('hidden'), value: observe(false) },
          ]),
          children: observe<TElement[]>([
            {
              id: observe(crypto.randomUUID()),
              tag: observe('p'),
              name: observe('p'),
              style: observe([]),
              type: observe('html'),
              attributes: observe([]),
              children: observe([
                {
                  id: observe(crypto.randomUUID()),
                  type: observe('text'),
                  name: observe('text'),
                  customData: { teste: 88 },
                  text: observe('"2 - Other with it self below:"'),
                }
              ]),
            },
            {
              id: observe(crypto.randomUUID()),
              slots: observe([]),
              type: observe('component'),
              name: observe('Component with component with it self'),
              referenceComponentId: observe('component-with-component-inside-with-this-inside'),
            },
          ]),
        },
      ]),
    },
  ]),
  value: observe<TElement[]>([
    {
      id: observe(crypto.randomUUID()),
      type: observe('html'),
      tag: observe('button'),
      name: observe('button'),
      customData: { teste: 1 },
      style: observe(undefined),
      attributes: observe([
        { name: observe('hidden'), value: observe(false) },
        { name: observe('title'), value: observe('"Some title in a button"') },
      ]),
      children: observe([
        {
          id: observe(crypto.randomUUID()),
          type: observe('text'),
          name: observe('text'),
          customData: { teste: 88 },
          text: observe('"Button"'),
        }
      ]),
    },
    /* {
      id: observe(crypto.randomUUID()),
      type: observe('slot'),
      customData: { teste: 4 },
      name: observe('slot'),
      componentId: observe('slot'),
    },
    {
      id: observe(crypto.randomUUID()),
      type: observe('html'),
      tag: observe('button'),
      customData: { teste: 3 },
      name: observe('button'),
      children: observe(undefined),
      attributes: observe([
        { name: observe('text'), value: observe('Clique me!') },
        { name: observe('disabled'), value: observe(true) },
      ]),
      style: observe([
        { name: observe('backgroundColor'), value: observe('transparent') },
        { name: observe('color'), value: observe('black') },
        { name: observe('border'), value: observe('thin solid') },
      ]),
    },
    {
      id: observe(crypto.randomUUID()),
      tag: observe('div'),
      type: observe('html'),
      children: observe([]),
      customData: { teste: 4 },
      attributes: observe([]),
      name: observe('div'),
      style: observe([]),
    },
    {
      id: observe(crypto.randomUUID()),
      tag: observe('div'),
      type: observe('html'),
      customData: { teste: 4 },
      attributes: observe([]),
      name: observe('div'),
      style: observe([]),
      children: observe([
        {
          id: observe(crypto.randomUUID()),
          style: observe([]),
          name: observe('input'),
          tag: observe('input'),
          type: observe('html'),
          attributes: observe([]),
          customData: { teste: 4 },
          children: observe(undefined),
        },
      ]),
    },
    {
      id: observe(crypto.randomUUID()),
      type: observe('component'),
      name: observe('CustomInput'),
      referenceId: observe('custom-input'),
    },
    {
      id: observe(crypto.randomUUID()),
      type: observe('component'),
      name: observe('CustomSendEmail'),
      referenceId: observe('custom-send-email'),
    } */
    /* {
      id: observe(crypto.randomUUID()),
      type: observe('component'),
      name: observe('slot-level-1'),
      referenceComponentId: observe('slot-level-1'),
      slots: observe<TElement<'slot-content'>[]>([
        {
          id: observe(crypto.randomUUID()),
          type: observe('slot-content'),
          referenceSlotId: observe('slot-level-1-slot'),
          children: observe([
            {
              id: observe(crypto.randomUUID()),
              type: observe('component'),
              name: observe('slot-level-2'),
              referenceComponentId: observe('slot-level-2'),
              slots: observe<TElement<'slot-content'>[]>([
                {
                  id: observe(crypto.randomUUID()),
                  type: observe('slot-content'),
                  referenceSlotId: observe('slot-level-2-slot'),
                  children: observe([
                    {
                      id: observe(crypto.randomUUID()),
                      type: observe('html'),
                      tag: observe('button'),
                      customData: { teste: 1 },
                      style: observe(undefined),
                      name: observe('button'),
                      attributes: observe([
                        { name: observe('hidden'), value: observe(false) },
                      ]),
                      children: observe([
                        {
                          tag: observe('a'),
                          id: observe(crypto.randomUUID()),
                          name: observe('a'),
                          type: observe('html'),
                          customData: { teste: 2 },
                          style: observe(undefined),
                          children: observe(undefined),
                          attributes: observe([
                            { name: observe('text'), value: observe('button') },
                          ]),
                        },
                      ]),
                    },
                  ]),
                }
              ]),
            },
          ]),
        }
      ]),
    }, */
  ]),
};