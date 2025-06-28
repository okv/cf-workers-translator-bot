export type ServerContacts = {
  profile: {
    name?: string;
  };
  wa_id: string;
};

export type ServerError = {
  code: number;
  title: string;
  message: string;
  error_data: {
    details: string;
  };
};

export type ServerMessage = {
  from: string;
  id: string;
  timestamp: string;
  context?: {
    forwarded?: boolean;
    frequently_forwarded?: boolean;
    from?: string;
    id?: string;
    referred_product?: {
      catalog_id: string;
      product_retailer_id: string;
    };
  };
  identity?: {
    acknowledged: boolean;
    created_timestamp: string;
    hash: string;
  };
  /**
   * Never saw this property on the wild, but it's documented
   */
  errors?: [ServerError];
  referral?: {
    source_url: string;
    source_id: string;
    source_type: 'ad' | 'post';
    headline: string;
    body: string;
    ctwa_clid: string;
    media_type: 'image' | 'video';
  } & (
    | {
        media_type: 'image';
        image_url: string;
      }
    | {
        media_type: 'video';
        video_url: string;
        thumbnail_url: string;
      }
  );
} & ServerMessageTypes;

export type ServerStatus = 'sent' | 'delivered' | 'read' | 'failed';

export type ServerInitiation =
  | 'authentication'
  | 'marketing'
  | 'utility'
  | 'service'
  | 'referral_conversion';

export type ServerConversation = {
  id: string;
  expiration_timestamp: number;
  origin: {
    type: ServerInitiation;
  };
};

export type ServerPricing = {
  pricing_model: 'CBP';
  /**
   * @deprecated Since v16 with the release of the new pricing model
   */
  billable?: boolean;
  category: ServerInitiation | 'authentication-international';
};

export type PostData = {
  object: 'whatsapp_business_account';
  entry: {
    id: string;
    changes: {
      value: {
        messaging_product: 'whatsapp';
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
      } & (
        | {
            contacts?: [ServerContacts];
            messages: [ServerMessage];
          }
        | {
            statuses: [
              {
                id: string;
                status: ServerStatus;
                timestamp: string;
                recipient_id: string;
                biz_opaque_callback_data?: string;
              } & (
                | {
                    conversation: ServerConversation;
                    pricing: ServerPricing;
                    errors: undefined;
                  }
                | {
                    conversation: undefined;
                    pricing: undefined;
                    errors: [ServerError];
                  }
              ),
            ];
          }
      );
      field: 'messages';
    }[];
  }[];
};

export type ServerMessageTypes =
  | ServerTextMessage
  | ServerAudioMessage
  | ServerDocumentMessage
  | ServerImageMessage
  | ServerStickerMessage
  | ServerVideoMessage
  | ServerLocationMessage
  | ServerContactsMessage
  | ServerInteractiveMessage
  | ServerButtonMessage
  | ServerReactionMessage
  | ServerOrderMessage
  | ServerSystemMessage
  | ServerRequestWelcomeMessage
  | ServerUnknownMessage;

export type ServerTextMessage = {
  id: string;
  type: 'text';
  text: {
    body: string;
  };
};

export type ServerAudioMessage = {
  id: string;
  type: 'audio';
  audio: {
    mime_type: string;
    sha256: string;
    id: string;
  };
};

export type ServerDocumentMessage = {
  id: string;
  type: 'document';
  document: {
    caption?: string;
    filename: string;
    mime_type: string;
    sha256: string;
    id: string;
  };
};

export type ServerImageMessage = {
  id: string;
  type: 'image';
  image: {
    caption?: string;
    mime_type: string;
    sha256: string;
    id: string;
  };
};

export type ServerStickerMessage = {
  id: string;
  type: 'sticker';
  sticker: {
    id: string;
    animated: boolean;
    mime_type: 'image/webp';
    sha256: string;
  };
};

export type ServerVideoMessage = {
  id: string;
  type: 'video';
  video: {
    mime_type: string;
    sha256: string;
    id: string;
  };
};

export type ServerLocationMessage = {
  id: string;
  type: 'location';
  location: {
    latitude: string;
    longitude: string;
    name?: string;
    address?: string;
  };
};

export type ServerContactsMessage = {
  id: string;
  type: 'contacts';
  contacts: [
    {
      addresses?: [
        {
          city?: string;
          country?: string;
          country_code?: string;
          state?: string;
          street?: string;
          type?: string;
          zip?: string;
        },
      ];
      birthday?: string;
      emails?: [
        {
          email?: string;
          type?: string;
        },
      ];
      name: {
        formatted_name: string;
        first_name?: string;
        last_name?: string;
        middle_name?: string;
        suffix?: string;
        prefix?: string;
      };
      org?: {
        company?: string;
        department?: string;
        title?: string;
      };
      phones?: [
        {
          phone?: string;
          wa_id?: string;
          type?: string;
        },
      ];
      urls?: [
        {
          url?: string;
          type?: string;
        },
      ];
    },
  ];
};

export type ServerInteractiveMessage = {
  id: string;
  type: 'interactive';
  interactive:
    | {
        type: 'button_reply';
        button_reply: {
          id: string;
          title: string;
        };
        list_reply: never;
        nfm_reply: never;
      }
    | {
        type: 'list_reply';
        list_reply: {
          id: string;
          title: string;
          description: string;
        };
        button_reply: never;
        nfm_reply: never;
      }
    | {
        type: 'nfm_reply';
        nfm_reply:
          | {
              name: 'address_message';
              body?: string;
              response_json: string;
            }
          | {
              name: 'flow';
              body: 'Sent';
              response_json: string;
            }
          | {
              name?: string;
              body?: string;
              response_json: string;
            };
        button_reply: never;
        list_reply: never;
      };
};

export type ServerButtonMessage = {
  id: string;
  type: 'button';
  button: {
    text: string;
    payload: string;
  };
};

export type ServerReactionMessage = {
  id: string;
  type: 'reaction';
  reaction: {
    emoji: string;
    message_id: string;
  };
};

export type ServerOrderMessage = {
  id: string;
  type: 'order';
  order: {
    catalog_id: string;
    product_items: [
      {
        product_retailer_id: string;
        quantity: string;
        item_price: string;
        currency: string;
      },
    ];
    text?: string;
  };
};

export type ServerSystemMessage = {
  id: string;
  type: 'system';
  system: {
    body: string;
    identity: string;
    /**
     * @deprecated Since v12.0 it is undefined, use `wa_id` instead.
     *
     * I'm actually stunned this exists, since I started the library with v13 or 14.
     */
    new_wa_id: number | string;
    wa_id: string;
    type: 'customer_changed_number' | 'customer_identity_changed' | string;
    customer: string;
  };
};

export type ServerRequestWelcomeMessage = {
  id: string;
  type: 'request_welcome';
};

export type ServerUnknownMessage = {
  id: string;
  type: 'unknown';
  errors: [
    {
      code: number;
      details: 'Message type is not currently supported';
      title: 'Unsupported message type';
    },
  ];
};

export type GetParams = {
  'hub.mode': 'subscribe';
  'hub.verify_token': string;
  'hub.challenge': string;
};

export type ClientMessageNames =
  | 'text'
  | 'audio'
  | 'document'
  | 'image'
  | 'sticker'
  | 'video'
  | 'location'
  | 'contacts'
  | 'interactive'
  | 'template'
  | 'reaction';

export declare abstract class ClientMessage {
  /**
   * The message type
   *
   * @internal
   */
  abstract get _type(): ClientMessageNames;
}
