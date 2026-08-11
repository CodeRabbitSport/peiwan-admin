# Use A Symmetric Product Link

Status: accepted

For the strict one-to-one association between products, add a nullable `linked_product_id` to `gamer_product`; both product rows point to each other. We do not add a relation table or group ID because the current domain has exactly two independent products, not a many-to-many or multi-member group. Binding, unbinding, rebind, sync, delete, and tenant cloning must maintain the two-way link transactionally; an active partial unique index and a self-link check protect the basic invariant.

The trade-off is deliberate: the direct link is the smallest model, but every relationship operation must repair both rows and tenant cloning must remap product IDs in a second pass. Supporting more than two products later would require a new association model.
